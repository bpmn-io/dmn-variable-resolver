/** @typedef {import('./VariableResolver').Variable} Variable */

/**
 * @typedef Context
 * @property {Variable[]} variables
 * @property {*} rootElement
 */

/**
 * Resolve variables available to a DMN element.
 * @param {*} moddleElement
 * @returns {Variable[]}
 */
export function resolveVariables(moddleElement) {
  const context = {
    variables: [],
    rootElement: getRootElement(moddleElement)
  };

  for (let current = moddleElement; current; current = current.$parent) {
    handle(current, context);
  }

  return context.variables;
}

function handle(element, context) {
  if (is(element, 'dmn:Decision')) {
    handleDecision(element, context);
  }
}

function handleDecision(decision, context) {
  for (const informationRequirement of decision.get('informationRequirement')) {
    handleInformationRequirement(informationRequirement, context);
  }
}

function handleInformationRequirement(informationRequirement, context) {
  const requiredInput = informationRequirement.get('requiredInput');
  if (requiredInput) {
    handleRequiredInput(requiredInput, context);
  }

  const requiredDecision = informationRequirement.get('requiredDecision');
  if (requiredDecision) {
    handleRequiredDecision(requiredDecision, context);
  }
}

function handleRequiredInput(reference, context) {
  const input = getReferencedElement(reference, context.rootElement);

  if (!input) {
    return;
  }

  const name = input.get('name');

  context.variables.push({
    name
  });
}

function handleRequiredDecision(reference, context) {
  const decision = getReferencedElement(reference, context.rootElement);

  if (!decision) {
    return;
  }

  const name = decision.get('name');

  /** @type Variable */
  const variable = {
    name
  };

  const decisionLogic = decision.get('decisionLogic');

  if (decisionLogic) {
    handleDecisionLogic(decisionLogic, variable, context);
  }

  context.variables.push(variable);
}

/**
 *
 * @param {*} decisionLogic
 * @param {Variable} currentVariable
 * @param {Context} context
 */
function handleDecisionLogic(decisionLogic, currentVariable, context) {
  if (is(decisionLogic, 'dmn:DecisionTable')) {
    const outputs = decisionLogic.get('output');

    handleOutputs(outputs, currentVariable, context);
  }
}

/**
 *
 * @param {Array<any>} outputs
 * @param {Variable} currentVariable
 * @param {Context} context
 */
function handleOutputs(outputs, currentVariable, context) {

  // for single output name is ignored
  if (outputs.length === 1) {
    return;
  }

  // in type it's schema but it's not handled in feel editor
  currentVariable.entries = outputs.map(output => ({ name: output.name }));
}

function getRootElement(element) {
  let rootElement = element;

  while (rootElement.$parent) {
    rootElement = rootElement.$parent;
  }

  return rootElement;
}

function getReferencedElement(reference, rootElement) {
  const href = reference.get('href');

  if (!href || !href.startsWith('#')) {
    return;
  }

  const id = href.slice(1);
  const drgElements = rootElement.get('drgElement');

  return drgElements.find(drgElement => drgElement.get('id') === id);
}

function is(moddleElement, type) {
  return moddleElement.$instanceOf(type);
}