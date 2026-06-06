import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { rfq, quotations } = await req.json();

    if (!rfq || !quotations || quotations.length === 0) {
      return NextResponse.json({
        recommendation: "Please provide both an RFQ and at least one Quote to generate an AI recommendation."
      });
    }

    const systemInstruction = `You are an expert Procurement Operations Director and Senior Strategic Sourcing Advisor. 
Analyze the provided RFQ (Request for Quotation) and its submitted Vendor Quotations. 
Present a crisp, professional executive brief with:
1. Executive Recommendation: Which bid is best balanced on Price, Rating, and SLA (Delivery Time). Give high-weightage to ratings and total-cost-of-ownership.
2. Direct Trade-Off Analysis: Highlight the lowest price, fastest delivery, and safest vendor (highest rating) in bullet points and why they matter.
3. Hidden Cost & Risk Audit: Any potential red flags (e.g. low delivery rating, high tax percentage, ultra-long lead times).
4. Strategic Negotiation Strategy: Three concise talking points to negotiate further with any of the vendors to get a better deal.

Keep it structured, visually elegant (use bold terms and Markdown bullets), and focus strictly on corporate procurement metrics. Format numbers cleanly, using decimal notation. Use a warm, confident, data-driven professional tone.` ;

    const prompt = `RFQ Title: ${rfq.title}
RFQ Item: ${rfq.item}
Target Quantity: ${rfq.quantity}
Deadline: ${rfq.deadline}
Description: ${rfq.description || 'No description'}

Vendor Bids to Compare:
${quotations.map((q: any, idx: number) => `
[Quote #${idx + 1}]
- Vendor Name: ${q.vendorName}
- Vendor Category: ${q.vendorCategory || 'General'}
- Vendor Rating: ${q.vendorRating || 4.0}/5
- Unit Price: $${q.unitPrice}
- Total Base Price: $${q.unitPrice * rfq.quantity}
- Tax (GST %): ${q.taxRate}%
- Total Price (with Tax): $${(q.unitPrice * rfq.quantity * (1 + q.taxRate / 100)).toFixed(2)}
- Delivery Lead Time: ${q.deliveryDays} Days
- Warranty / Support Terms: ${q.terms || 'Standard support terms'}
- Vendor Comments: "${q.notes || 'No comments'}"
`).join('\n')}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text || "Unable to generate analysis at this time.";

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("Gemini route error:", error);
    return NextResponse.json({ 
      error: "Failed to query AI analyst helper.", 
      details: error.message 
    }, { status: 500 });
  }
}
