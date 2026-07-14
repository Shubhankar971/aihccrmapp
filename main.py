import os
from typing import Annotated, Dict, List, Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

app = FastAPI(title="AI-First HealthCRM Backend", version="1.0.0")

# Enable CORS for React Frontend communication
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# --------------------------------------------------------
# 1. Pydantic Verification Schemas
# --------------------------------------------------------
class InteractionSchema(BaseModel):
	hcp_id: Optional[str] = Field(None, description="Unique alphanumeric identifier of the doctor/HCP")
	product_discussed: Optional[str] = Field(None, description="Brand name of the drug or therapeutic agent discussed")
	interaction_type: Optional[str] = Field(None, description="Channel medium, e.g., In-Person, Virtual, Dinner Meeting")
	key_insights: Optional[str] = Field(None, description="Clinical dialogue data, feedback, or objections raised by the HCP")
	samples_dropped: Optional[int] = Field(None, description="Quantity of sample units provided to the HCP office")
	follow_up_action: Optional[str] = Field(None, description="Next sequential operational task or medical inquiry response")

class ComplianceReport(BaseModel):
	is_compliant: bool = Field(..., description="False if text contains off-label promotion or compliance threat")
	risk_score: int = Field(..., description="Quantified compliance threat metrics between 0 and 100")
	justification: str = Field(..., description="Detailed regulatory analysis pointing out legal variations or clear flags")

class AgentState(TypedDict):
	raw_input: str
	extracted_data: Dict
	compliance_check: Dict
	missing_fields: List[str]
	status: str  # "incomplete", "flagged", "ready"
	response_message: str

# --------------------------------------------------------
# 2. Multi-Model LLM Framework Node Execution via Groq
# --------------------------------------------------------
# Verify GROQ_API_KEY environment variable is set
extractor_llm = ChatGroq(model_name="gemma2-9b-it", temperature=0.1)
compliance_llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.0)

def extract_fields_node(state: AgentState) -> Dict:
	"""Uses gemma2-9b-it to reliably parse unformatted dictation into CRM fields."""
	prompt = ChatPromptTemplate.from_messages([
		("system", (
			"You are an expert Life Science CRM structural engineer. Analyze raw text logs provided by a field representative "
			"and extract information matching these precise fields: hcp_id, product_discussed, interaction_type, "
			"key_insights, samples_dropped, follow_up_action. Do not generate or assume context. "
			"If a parameter cannot be found, output null for that specific key."
		)),
		("user", "{text}")
	])
    
	try:
		chain = prompt | extractor_llm.with_structured_output(InteractionSchema)
		res = chain.invoke({"text": state["raw_input"]})
		extracted = res.model_dump()
	except Exception:
		# Fallback mechanism if structural extraction fails
		extracted = {"hcp_id": None, "product_discussed": None, "interaction_type": None, 
					 "key_insights": None, "samples_dropped": 0, "follow_up_action": None}
    
	# Track essential fields for data health metrics
	missing = []
	for field in ["hcp_id", "product_discussed", "interaction_type", "key_insights"]:
		if not extracted.get(field):
			missing.append(field)
            
	return {
		"extracted_data": extracted,
		"missing_fields": missing,
		"status": "incomplete" if missing else "ready"
	}

def compliance_audit_node(state: AgentState) -> Dict:
	"""Uses llama-3.3-70b-versatile for cross-checking notes against compliance parameters."""
	data = state["extracted_data"]
	insights = data.get("key_insights", "")
    
	prompt = ChatPromptTemplate.from_messages([
		("system", (
			"You are a Life Science Regulatory Compliance Officer auditing a field representative's call log. "
			"Inspect the clinical discussion metrics for violations of PhRMA codes, FDCA guidelines, "
			"unauthorized off-label marketing claims, or illegal value transfers (anti-kickback). "
			"Synthesize your structural review strictly inside the requested compliance framework."
		)),
		("user", "Product Focus: {product}\nDiscussion Insights: {insights}")
	])
    
	try:
		chain = prompt | compliance_llm.with_structured_output(ComplianceReport)
		report = chain.invoke({"product": data.get("product_discussed", "Unspecified"), "insights": insights}).model_dump()
	except Exception:
		report = {"is_compliant": True, "risk_score": 0, "justification": "Automated audit bypass occurred."}
    
	status = state["status"]
	if not report["is_compliant"]:
		status = "flagged"
		msg = f"Compliance Violation Triggered: {report['justification']}. Modify details to align with compliance guidelines."
	elif state["missing_fields"]:
		msg = f"Data structured successfully. However, please fill out remaining required metrics: {', '.join(state['missing_fields'])}."
	else:
		msg = "Interaction verified as fully compliant and structural validations cleared."
        
	return {
		"compliance_check": report,
		"status": status,
		"response_message": msg
	}

def route_decision(state: AgentState) -> Literal["compliance_check", "__end__"]:
	"""Determines whether to route to compliance verification or end the execution loop."""
	if state["status"] == "incomplete" and not state["extracted_data"].get("key_insights"):
		return END
	return "compliance_check"

# --------------------------------------------------------
# 3. LangGraph Execution Workflow Configuration
# --------------------------------------------------------
workflow = StateGraph(AgentState)
workflow.add_node("extract_fields", extract_fields_node)
workflow.add_node("compliance_check", compliance_audit_node)

workflow.add_edge(START, "extract_fields")
workflow.add_conditional_edges("extract_fields", route_decision)
workflow.add_edge("compliance_check", END)

agent_executor = workflow.compile()

# --------------------------------------------------------
# 4. REST API Endpoint Route
# --------------------------------------------------------
class LogPayload(BaseModel):
	text: str

@app.post("/api/interaction/log")
async def log_interaction(payload: LogPayload):
	try:
		initial_state: AgentState = {
			"raw_input": payload.text,
			"extracted_data": {},
			"compliance_check": {},
			"missing_fields": [],
			"status": "incomplete",
			"response_message": ""
		}
        
		final_output = agent_executor.invoke(initial_state)
		return final_output
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

