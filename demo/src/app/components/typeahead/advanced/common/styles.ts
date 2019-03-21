import { PRIMARY_COLOR } from '../../common/example/style';

const GO_TO_EXAMPLE_COLOR = '#007bff';

export const STYLES = `
.definition, .defined {
  font-style: italic;
  border-bottom: 1px solid;
  padding-bottom: 0.05em;
}

.defined {
  border-bottom-color: #0064ff;
  color: #0064ff;
}

.definition {
  font-weight: bold;
  border-bottom-color: #black;
}

.go-to-example > a {
  display: block;
  width: 50%;
  text-align: center;
  margin: 1em auto;

  color: ${GO_TO_EXAMPLE_COLOR};
  text-decoration: none;

  border: 2px solid ${GO_TO_EXAMPLE_COLOR};
  padding: 1em;
  border-radius: 0.5em;
}

.reset {
  width: 100%;
  margin: 1em 0;
}

.code-tabs {
  display: flex;
  margin: 1em 0;
}

.code-tabs > div {
  cursor: pointer;
  flex: 1;
  border-bottom: 0.1em solid gray;
  padding-bottom: 0.25em;
  margin: 0 1em;
  text-align: center;
}
.code-tabs > div.focused {
  border-color: ${PRIMARY_COLOR};
}
`;

const MATRIX_CSS = (() => {
  const borderColor = '#CCC';
  const border = `1px solid ${borderColor}`;
  const padding = '0.5em';
  const cssClass = 'matrix';
  const rootSelector = `table.${cssClass}`;
  return {
    borderColor,
    border,
    padding,
    cssClass,
    rootSelector,
  };
})();

export const MATRIX_STYLE = `
${MATRIX_CSS.rootSelector} {
  margin: 2em auto;
}

${MATRIX_CSS.rootSelector} th, ${MATRIX_CSS.rootSelector} td {
  padding: ${MATRIX_CSS.padding};
}

${MATRIX_CSS.rootSelector} td { text-align: center; }
${MATRIX_CSS.rootSelector} tbody th { text-align: left; }

${MATRIX_CSS.rootSelector} thead th {
  border-bottom: ${MATRIX_CSS.border};
  text-align: center; vertical-align: top;
}

${MATRIX_CSS.rootSelector} tbody th,
${MATRIX_CSS.rootSelector} thead th:nth-child(1),
${MATRIX_CSS.rootSelector} tr > *:nth-child(2) {
  border-right: ${MATRIX_CSS.border};
}

${MATRIX_CSS.rootSelector} thead th:nth-child(1) {
  position: relative;
  width: 10em; height: 3.5em;
}
${MATRIX_CSS.rootSelector} thead th:nth-child(1) .left {
  display: inline-block; position: absolute;
  bottom: ${MATRIX_CSS.padding}; left: ${MATRIX_CSS.padding};
}
${MATRIX_CSS.rootSelector} thead th:nth-child(1) .right {
  display: inline-block; position: absolute;
  top: ${MATRIX_CSS.padding}; right: ${MATRIX_CSS.padding};
}
${MATRIX_CSS.rootSelector} thead th:nth-child(1) .separator {
  background-image: linear-gradient(to top right, transparent 49%, ${MATRIX_CSS.borderColor}, transparent 51%);
  display: inline-block; position: absolute;
  bottom: 0; right: 0; left: 0;
  top: 30%;
}
`;
