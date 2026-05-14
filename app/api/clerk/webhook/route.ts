import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase';

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Get Svix signature headers
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers');
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  const body = await req.text();

  // Verify signature
  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Clerk webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[clerk-webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'user.created': {
        // Find the primary email
        const primaryEmailId = event.data.primary_email_address_id;
        const emailObj = event.data.email_addresses?.find(
          (e) => e.id === primaryEmailId
        );
        const email = emailObj?.email_address?.toLowerCase().trim();

        if (!email) {
          console.error('No primary email found for user', event.data.id);
          break;
        }

        // Upsert the user — if they already exist (e.g., grandfathered pilot user),
        // don't overwrite their subscription status
        const { error } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              subscription_status: 'none',
              founding_member: false,
              is_tester: false,
            },
            {
              onConflict: 'email',
              ignoreDuplicates: true, // Don't overwrite existing rows
            }
          );

        if (error) {
          console.error('Failed to create user row:', error);
          throw error;
        }

        console.log(`[clerk-webhook] User row created/exists for ${email}`);
        break;
      }

      case 'user.updated': {
        // Could sync email changes here if needed; for now just log
        console.log(`[clerk-webhook] User updated: ${event.data.id} (no action)`);
        break;
      }

      case 'user.deleted': {
        // Could clean up Supabase row here; for now just log
        console.log(`[clerk-webhook] User deleted: ${event.data.id} (no action)`);
        break;
      }

      default:
        console.log(`[clerk-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Clerk webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}