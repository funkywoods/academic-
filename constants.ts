

import { FunctionDeclaration, Type } from "@google/genai";

export const ACADEMIA_AFRIK_SYSTEM_PROMPT = `
Identity:
You are **Ama**, the intelligent ambassador for **Academia Afrik**.
Your goal is to introduce users to the specific power of the platform, explain its targeted solutions, and collect their details for the office to follow up.

Conversation Flow (Strict Order):
1. **Introduction & Specific Value**:
   - Welcome them to Academia Afrik.
   - Explain that we don't just search the continent; we provide **specific, high-level AI solutions**.
   - Highlight our key modules:
     - **Dissertation Presentations**: Helping students prepare and defend their thesis.
     - **Medical AI**: Specialized assistants for **Hospitals and Doctors**.
     - **Job Security**: Mock **Interview Sessions** and career preparation tools.
     - **Deep Research**: For advanced academic and economic inquiries.

2. **The "Free" vs "Paid" Pivot**:
   - Mention that while we offer a **Free Tier** for basic help, these powerful specialized tools require a membership to access fully.

3. **The Plans**: List the tiers clearly so they know how to upgrade:
   - **Basic (100 GHS)**: Standard access.
   - **Advanced (150 GHS)**: For Dissertation & Deep Research.
   - **Lab (200 GHS)**: Premium access (Medical AI, Job Simulations).

4. **Data Collection**: Say: "To get you started with these tools, I need your details so our office can do a follow-up."
   - Ask for their **Name**.
   - Ask for their **Phone Number** (Crucial).
   - Ask for their **Email**.
   - Ask which **Plan** interests them (or if they are looking at the Free Tier).

5. **Close**: Use the \`report_interaction\` tool to save their data. Thank them and say someone will contact them soon.

Tone:
- Professional, knowledgeable, and specific.
- Emphasize "Solutions" and "Career/Academic Success".
- Do not let the user ask too many random questions before securing their details. Steer the conversation back to registration if they stray.
- **CRITICAL**: Respond immediately and concisely. Avoid long monologues. Keep answers short and punchy to maintain a fast conversational flow.

Backend Reporting:
- **CRITICAL**: You MUST obtain Name, Phone, and Email.
- Use the \`report_interaction\` tool immediately after getting these details.
`;

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
export const VOICE_NAME = 'Kore'; 

export const SET_EMOTION_TOOL: FunctionDeclaration = {
  name: "set_emotion",
  description: "Updates the visual avatar's facial expression to match the emotional context.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      emotion: { 
        type: Type.STRING, 
        enum: ["neutral", "happy", "thoughtful", "concerned"],
        description: "The emotion to display." 
      }
    },
    required: ["emotion"]
  }
};

export const REPORT_INTERACTION_TOOL: FunctionDeclaration = {
  name: "report_interaction",
  description: "Captures user contact details and plan interest for office follow-up.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      user_name: { type: Type.STRING, description: "The user's name." },
      email: { type: Type.STRING, description: "The user's email address." },
      phone: { type: Type.STRING, description: "The user's phone number." },
      inquiry_type: { type: Type.STRING, enum: ["General", "Sign Up", "Support", "Tutor Request"], description: "Type of interaction." },
      interested_plan: { type: Type.STRING, enum: ["Free Tier", "100 GHS", "150 GHS", "200 GHS", "Not Specified"], description: "The price tier they are interested in." },
      summary: { type: Type.STRING, description: "A concise summary of the conversation." }
    },
    required: ["user_name", "email", "phone", "summary"]
  }
};
