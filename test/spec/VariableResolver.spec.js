import Modeler from 'dmn-js/lib/Modeler';

import { DmnVariableResolverModule } from '../../lib';

import SimpleDmn from '../fixtures/simple.dmn';

import { singleStart } from '../TestHelper';

describe('VariableResolver', function() {


  let container;
  let editor;

  function getModule(name) {
    return editor.getActiveViewer().get(name);
  }

  beforeEach(function() {
    container = document.createElement('div');
    container.className = 'test-container';

    document.body.appendChild(container);

    const options = {
      container: container,
      common: {
        keyboard: {
          bindTo: document
        }
      }
    };

    [ 'drd', 'decisionTable', 'literalExpression' ].forEach(type => {
      options[type] = {
        additionalModules: [
          DmnVariableResolverModule
        ]
      };
    });

    editor = new Modeler(options);
  });

  singleStart || afterEach(function() {
    if (editor) {
      editor.destroy();

      editor = null;
    }

    document.body.removeChild(container);
  });


  (singleStart ? it.only : it)('should provide variables from input data', async function() {

    // given
    await editor.importXML(SimpleDmn);
    const variableResolver = getModule('variableResolver');
    const elementRegistry = getModule('elementRegistry');
    const decision = elementRegistry.get('Decision_1');
    const bo = getBusinessObject(decision);

    // when
    const variables = variableResolver.getVariables(bo);

    // then
    expect(variables).to.eql([
      {
        name: 'Season',
        origin: getBusinessObject(elementRegistry.get('InputData_0wfh4a3'))
      }
    ]);
  });
});



// helper //////////////////////
function getBusinessObject(element) {
  return element.businessObject || element;
}
