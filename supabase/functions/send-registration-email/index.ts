import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cagd.gov.gh",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, eventTitle, eventDate, eventVenue } = await req.json();

    // Skip placeholder emails
    if (!email || email.includes("@cagd.internal")) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const formattedDate = eventDate
      ? new Date(eventDate).toLocaleDateString("en-GB", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })
      : "Date TBC";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
        <div style="background:linear-gradient(135deg,#003087,#0066cc);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;font-size:24px;margin:0;">Controller & Accountant-General's Department</h1>
          <p style="color:#cce5ff;font-size:14px;margin-top:8px;">Republic of Ghana</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#003087;margin-bottom:8px;">Registration Confirmed!</h2>
          <p style="color:#444;line-height:1.6;">Dear <strong>${name}</strong>,</p>
          <p style="color:#444;line-height:1.6;">
            Thank you for registering for the following event. Your registration has been received successfully.
          </p>
          <div style="background:#f4f8ff;border-left:4px solid #003087;padding:16px 20px;margin:24px 0;border-radius:4px;">
            <h3 style="margin:0 0 12px;color:#003087;">${eventTitle}</h3>
            <p style="margin:4px 0;color:#555;"><strong>Date:</strong> ${formattedDate}</p>
            ${eventVenue ? `<p style="margin:4px 0;color:#555;"><strong>Venue:</strong> ${eventVenue}</p>` : ""}
          </div>
          <p style="color:#444;line-height:1.6;">
            Please keep this email as confirmation of your registration. Further details will be communicated closer to the event date.
          </p>
          <p style="color:#444;line-height:1.6;">
            If you have any questions, please contact us at
            <a href="mailto:info@cagd.gov.gh" style="color:#003087;">info@cagd.gov.gh</a>.
          </p>
        </div>
        <div style="background:#f0f4ff;padding:16px 24px;text-align:center;border-top:1px solid #d0dff7;">
          <p style="margin:0;font-size:12px;color:#888;">
            Controller & Accountant-General's Department · Ministries, Accra, Ghana<br/>
            <a href="https://cagd.gov.gh" style="color:#003087;">cagd.gov.gh</a>
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CAGD Events <noreply@cagd.gov.gh>",
        to: [email],
        subject: `Registration Confirmed: ${eventTitle}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Resend API error");
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Email send error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
