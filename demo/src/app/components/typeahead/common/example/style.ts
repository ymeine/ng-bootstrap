export const PRIMARY_COLOR = '#007bff';

const WRAPPER = 'wrapper';

export const STYLE = `
  .title {
    display: flex;
    align-items: center;
    margin: 0 1em;
  }

  .title > .spacer {
    flex-grow: 1;
  }

  .title > .content {
    flex-grow: 0;
  }

  .${WRAPPER} {
    width: 100%;

    border: 0.25em solid hsla(24, 20%, 50%, 0.08);
    border-radius: 0.5em;
    padding: 1em;
    margin-bottom: 2em;
    margin-top: 1em;
  }

  .${WRAPPER} > .instance {
    padding: 2em;
  }

  .${WRAPPER} h3 {
    display: none;
  }

  .${WRAPPER} > details {
    margin-bottom: 0.5em;
  }

  .${WRAPPER} > details > summary {
    outline: none;
    cursor: pointer;
    font-weight: bold;
    padding-bottom: 0.25em;
    margin-bottom: 1em;
  }

  .${WRAPPER} > details > summary:focus {
    border-bottom: 1px solid ${PRIMARY_COLOR};
  }

  .${WRAPPER} > details > *:nth-child(2) {
    border-left: 0.1em solid;
    border-image: linear-gradient(to bottom, ${PRIMARY_COLOR}77 0, ${PRIMARY_COLOR} 50%, ${PRIMARY_COLOR}77 100%) 1 100%;
    padding-left: 1.25em;
    margin-left: 0.75em;
  }
`;
