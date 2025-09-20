import type { RequestHandler } from "express";

export const notifyInstructorRequest: RequestHandler = async (req, res) => {
  try {
    const { uid, name, email } = req.body || {};
    const url = process.env.ZAPIER_WEBHOOK_URL;
    if (!url) return res.status(200).json({ ok: true, skipped: true });

    const payload = {
      type: "instructor_request",
      uid,
      name,
      email,
      at: new Date().toISOString(),
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.status(200).json({ ok: true, status: r.status });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: true, error: true });
  }
};
