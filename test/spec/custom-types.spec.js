import { expect } from 'chai';
import { DmnModdle } from 'dmn-moddle';
import FeelEditor from '@bpmn-io/feel-editor';
import { CompletionContext } from '@codemirror/autocomplete';

import { parse, findElementById } from '../TestHelper';
import CustomTypesDmn from '../fixtures/custom-types.dmn';

import { resolveVariables } from '../../lib';


describe('custom type variables', function() {

  let parsed;

  beforeEach(async function() {
    parsed = await parse(CustomTypesDmn);
  });

  function element(id) {
    return findElementById(parsed, id);
  }

  function parameter() {
    return resolveVariables(element('Body'))[0];
  }

  it('should expand typed inputs and single outputs', function() {

    // when
    const variables = resolveVariables(element('TargetExpression'));

    // then
    expect(variables.map(variable => variable.name)).to.eql([ 'applicant', 'source' ]);
    for (const variable of variables) {
      expect(variable.detail).to.equal('Applicant');
      expect(variable.entries.map(entry => entry.name)).to.eql([
        'name', 'age', 'address', 'previousAddresses', 'contact'
      ]);
      expect(variable.entries[2].entries).to.eql([ { name: 'city', detail: 'string' } ]);
      expect(variable.entries[3]).to.include({ name: 'previousAddresses', isList: true });
      expect(variable.entries[3].entries).to.eql(variable.entries[2].entries);
      expect(variable.entries[4].entries).to.eql([ { name: 'email', detail: 'string' } ]);
    }
  });

  it('should expand collection aliases for formal parameters', function() {

    // when
    const variable = parameter();

    // then
    expect(variable).to.include({ name: 'applicants', detail: 'Applicants', isList: true });
    expect(variable.entries[0]).to.eql({ name: 'name', detail: 'string' });
  });

  it('should resolve ID references', function() {

    // given
    element('Parameter').typeRef = 'applicantType';

    // then
    expect(parameter().entries[0].name).to.equal('name');
  });

  it('should prefer type names over colliding IDs', function() {

    // given
    element('addressType').id = 'Applicant';
    element('Parameter').typeRef = 'Applicant';

    // then
    expect(parameter().entries[0].name).to.equal('name');
  });

  it('should keep repeated field references independent', function() {

    // given
    const variable = parameter();

    // when
    variable.entries[2].entries[0].name = 'changed';

    // then
    expect(variable.entries[3].entries[0].name).to.equal('city');
    expect(parameter().entries[2].entries[0].name).to.equal('city');
  });

  it('should expand multiple outputs without changing output names', function() {

    // given
    const output = element('Output');
    element('SourceTable').output.push(DmnModdle().create('dmn:OutputClause', {
      name: 'other', typeRef: 'Address'
    }));

    // when
    const variable = resolveVariables(element('TargetExpression'))[1];

    // then
    expect(variable.entries.map(entry => entry.name)).to.eql([ output.name, 'other' ]);
    expect(variable.entries[1].entries).to.eql([ { name: 'city', detail: 'string' } ]);
  });

  it('should leave missing and external references unresolved', function() {

    for (const typeRef of [ 'Missing', 'external:Applicant' ]) {

      // given
      element('Parameter').typeRef = typeRef;

      // then
      expect(parameter()).to.eql({
        name: 'applicants', detail: typeRef, origin: element('Parameter')
      });
    }
  });

  it('should stop recursive references without omitting sibling fields', function() {

    // given
    const address = element('addressType');
    address.itemComponent[0].typeRef = 'Applicant';

    // when
    const variable = parameter();

    // then
    expect(variable.entries[2].entries[0]).to.eql({ name: 'city', detail: 'Applicant', entries: [] });
    expect(variable.entries[3].entries[0]).to.eql({ name: 'city', detail: 'Applicant', entries: [] });
    expect(variable.entries[4].entries[0].name).to.equal('email');
  });

  it('should stop circular aliases', function() {

    // given
    element('applicantType').itemComponent = [];
    element('applicantType').typeRef = 'Applicants';

    // then
    expect(parameter()).to.include({ detail: 'Applicants', isList: true });
    expect(parameter().entries).to.eql([]);
  });

  it('should reflect model changes between resolutions', function() {

    // given
    parameter();
    element('addressType').itemComponent[0].name = 'postcode';

    // then
    expect(parameter().entries[2].entries[0].name).to.equal('postcode');
  });

  it('should preserve field structure after saving and reimporting', async function() {

    // given
    const { xml } = await DmnModdle().toXML(parsed.rootElement);
    const before = parameter().entries;
    parsed = await parse(xml);

    // then
    expect(parameter().entries).to.eql(before);
  });

  [
    [ 'applicant.', [ 'name', 'age', 'address', 'previousAddresses', 'contact' ] ],
    [ 'applicants[1].', [ 'name', 'age', 'address', 'previousAddresses', 'contact' ] ],
    [ 'applicants[1].address.', [ 'city' ] ],
    [ 'applicants[1].previousAddresses[1].', [ 'city' ] ],
    [ 'applicants[1].contact.', [ 'email' ] ]
  ].forEach(([ expression, names ]) => {

    it('should autocomplete ' + expression, async function() {

      // given
      const container = document.createElement('div');
      document.body.appendChild(container);
      const editor = new FeelEditor({
        container,
        value: expression,
        variables: [ ...resolveVariables(element('Body')), ...resolveVariables(element('TargetExpression')) ]
      });

      try {
        const state = editor._cmEditor.state;
        const sources = state.languageDataAt('autocomplete', expression.length);

        // when
        const results = await Promise.all(sources.map(source =>
          source(new CompletionContext(state, expression.length, true))
        ));

        // then
        const labels = results.filter(Boolean).flatMap(result =>
          result.options.map(option => option.label)
        );

        expect(labels).to.include.members(names);
      } finally {
        editor._cmEditor.destroy();
        container.remove();
      }
    });
  });

});
