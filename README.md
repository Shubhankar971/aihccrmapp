This project was created with [Create New App](https://github.com/qodesmith/create-new-app).
# HealthCRM AI-First Log Interaction Screen

An enterprise-grade, compliance-first Customer Relationship Management (CRM) module tailored for Life Sciences and Healthcare Professional (HCP) field engagement. This portal allows pharmaceutical and medical device field representatives to seamlessly log call interactions through either an unformatted conversational dictation interface or a structured validation form. 

The system leverages a multi-model orchestration workflow via LangGraph, utilizing **Groq** infrastructure (`gemma2-9b-it` for structural entity extraction and `llama-3.3-70b-versatile` for real-time PhRMA/regulatory compliance screening).

---

## 🚀 Key Architectural Features

* **Conversational Dictation Engine:** Uses `gemma2-9b-it` to parse conversational summaries, messy voice-to-text transcripts, and unstructured field notes into structured database objects.
* **Real-Time Regulatory Compliance Guardrails:** Automatically routes data through a `llama-3.3-70b-versatile` compliance evaluator node to flags potential PhRMA code violations, off-label marketing issues, or anti-kickback (Value Transfer) tracking errors before database persistence.
* **State-Driven Multi-Agent Design:** Managed using LangGraph pipelines to dynamically route inputs based on data completeness and risk profiles.
* **Modern Life-Sciences UI:** Built with React 18, Redux Toolkit, and styled natively with the clean, highly scannable **Google Inter** typography framework.

---

## 📁 Repository Structure

```text
healthcrm-app/
├── backend/
│   ├── main.py                # FastAPI Application & LangGraph Workflow Logic
│   └── requirements.txt       # Python Dependencies
└── frontend/
    ├── package.json           # Node Packages & Scripts
    ├── public/
    │   └── index.html         # Application Core DOM Template (Google Inter Fonts)
    └── src/
        ├── index.js           # React Virtual DOM Bootstrapper
        ├── store/
        │   ├── index.js       # Central Redux Architecture Store
        │   └── crmSlice.js    # Async Thunks, State Reducers & API Actions
        └── components/
            └── LogInteractionScreen.jsx # Dual-Interface Workspace View Component
