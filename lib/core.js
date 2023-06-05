
/**
 * Resolve variables available to a DMN element.
 * @param {*} moddleElement
 */
export function resolveVariables(moddleElement) {
  const context = {
    variables: [],
    rootElement: getRootElement(moddleElement)
  };

  for (let current = moddleElement; current; current = current.$parent) {
    visit(current, context);
  }

  return context.variables;
}

function visit(element, context) {
  if (is(element, 'dmn:Decision')) {
    visitDecision(element, context);
  }
}

function visitDecision(decision, context) {
  for (const informationRequirement of decision.get('informationRequirement')) {
    visitInformationRequirement(informationRequirement, context);
  }
}

function visitInformationRequirement(informationRequirement, context) {
  const requiredInput = informationRequirement.get('requiredInput');

  if (requiredInput) {
    visitRequiredInput(requiredInput, context);
  }
}

function visitRequiredInput(reference, context) {
  const input = getReferencedElement(reference, context.rootElement);

  if (!input) {
    return;
  }

  const name = input.get('name');

  context.variables.push({
    name
  });
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