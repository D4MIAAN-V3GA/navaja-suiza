import { useCallback } from "react";
import { useParams, Navigate, useOutletContext } from "react-router-dom";
import { getTool } from "./tools";
import { getGuide } from "./data/toolGuides";
import ToolFrame from "./ToolFrame";

// Renderiza la herramienta según el :id de la URL. 404 suave al grid.
// El encabezado (banda de color, título, chips) lo pone ToolFrame para las
// nueve por igual; las calculadoras solo traen su interfaz.
export default function ToolPage() {
  const { id } = useParams();
  const { isFav, toggleFav, toolAccent, reportAccent } = useOutletContext();
  // Se avisa al shell del color con el que la herramienta se está pintando
  // ahora, con su id: el riel y la lista lateral lo siguen, y al cambiar de
  // herramienta el color no se hereda.
  const onAccentChange = useCallback(
    (accent) => reportAccent?.(id, accent),
    [id, reportAccent]
  );

  const tool = getTool(id);
  if (!tool) return <Navigate to="/herramientas" replace />;

  const Tool = tool.component;
  return (
    <ToolFrame
      tool={tool}
      guide={getGuide(id)}
      accent={toolAccent}
      isFav={isFav}
      toggleFav={toggleFav}
    >
      <Tool onAccentChange={onAccentChange} />
    </ToolFrame>
  );
}
