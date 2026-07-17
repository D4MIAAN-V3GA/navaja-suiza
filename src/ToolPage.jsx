import { useParams, Navigate } from "react-router-dom";
import { getTool } from "./tools";

// Renderiza la herramienta según el :id de la URL. 404 suave al grid.
export default function ToolPage() {
  const { id } = useParams();
  const tool = getTool(id);
  if (!tool) return <Navigate to="/herramientas" replace />;
  const Tool = tool.component;
  return <Tool />;
}
