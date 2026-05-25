from langgraph.graph import StateGraph, END

from agent.state import AgentState
from agent.nodes import node_retrieve, node_generate, node_score, node_escalate


def _route_after_scoring(state: AgentState) -> str:
    return "escalate" if state["should_escalate"] else END


def build_graph():
    g = StateGraph(AgentState)

    g.add_node("retrieve", node_retrieve)
    g.add_node("generate", node_generate)
    g.add_node("score", node_score)
    g.add_node("escalate", node_escalate)

    g.set_entry_point("retrieve")
    g.add_edge("retrieve", "generate")
    g.add_edge("generate", "score")
    g.add_conditional_edges("score", _route_after_scoring)
    g.add_edge("escalate", END)

    return g.compile()


support_agent = build_graph()
