import { DmnModdle } from 'dmn-moddle';
import FeelEditor from '@bpmn-io/feel-editor';
import { CompletionContext } from '@codemirror/autocomplete';
import { expect } from 'chai';
import { parse, findElementById } from '../TestHelper';
import Diagram from '../fixtures/decision-service.dmn';
import { resolveVariables } from '../../lib';


describe('decision service variables', function() {

  let parsed;

  beforeEach(async function() {
    parsed = await parse(Diagram);
  });

  function element(id) {
    return findElementById(parsed, id);
  }

  function resolve(id) {
    return resolveVariables(element(id));
  }

  for (const id of [ 'Body1', 'BkmBody' ]) {
    it(`should resolve required service from ${id}`, function() {

      // when
      const variables = resolve(id);

      // then
      expect(variables).to.eql([ {
        name: 'Loan Eligibility',
        origin: element('Complete'),
        type: 'function',
        params: [ { name: 'age', type: 'number' }, { name: 'creditScore', type: 'number' } ]
      } ]);
    });
  }

  it('should support a service without inputs', function() {
    expect(resolve('Body2')[0].params).to.eql([]);
  });

  it('should preserve untyped parameters', function() {
    expect(resolve('Body3')[0].params).to.eql([ { name: 'untyped' } ]);
  });

  it('should prefer variable name over element name', function() {
    expect(resolve('Body4')[0].params).to.eql([ { name: 'monthlyIncome', type: 'number' } ]);
  });

  it('should ignore unnamed services', function() {
    expect(resolve('Body5')).to.eql([]);
  });

  [
    [ 'missing', 'Body6' ],
    [ 'external', 'Body7' ],
    [ 'invalid', 'Body8' ],
    [ 'unnamed', 'Body9' ]
  ].forEach(([ description, id ]) => {
    it(`should not suggest an incomplete signature for ${description} input`, function() {
      expect(resolve(id)).to.eql([]);
    });
  });

  it('should not expose unrelated services', function() {
    expect(resolve('BodyNoRequirement')).to.eql([]);
  });

  it('should preserve service signatures after XML reimport', async function() {

    // given
    const { xml } = await DmnModdle().toXML(parsed.rootElement);
    const before = resolve('Body1')[0].params;

    // when
    parsed = await parse(xml);

    // then
    expect(resolve('Body1')[0].params).to.eql(before);
  });

  it('should offer the service as a FEEL function completion', async function() {

    // given
    const container = document.createElement('div');
    document.body.appendChild(container);
    const editor = new FeelEditor({
      container,
      value: 'Loan',
      variables: resolve('Body1')
    });

    try {
      const state = editor._cmEditor.state;

      // when
      const results = await Promise.all(state.languageDataAt('autocomplete', 4).map(source =>
        source(new CompletionContext(state, 4, true))
      ));

      // then
      const options = results.filter(Boolean).flatMap(result => result.options);
      expect(options.find(option =>
        option.label === 'Loan Eligibility(age: number, creditScore: number)'
      )).to.include({ type: 'function' });
    } finally {
      editor._cmEditor.destroy();
      container.remove();
    }
  });

});
