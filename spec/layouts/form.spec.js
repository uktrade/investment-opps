/* jshint ignore:start*/
describe('form.html content tags', function() {
  var html = render('partials/form.html');
  var fields = parseCmsTags(html);
  var formBlock= fields['formBlock'];

  it('should have only "formBlock" defined',function() {
    expect(Object.keys(fields).length).toBe(1);
  });

  it('should have "formBlock" defined',function() {
    expect(formBlock).toBeDefined();
  });

  it('"formBlock" should be defined as global',function() {
    expect(formBlock.global).toBe(true);
  });

  it('"formBlock" should be of type content',function() {
    expect(formBlock.type).toBe('content');
  });

  it('"formBlock" should have a label defined',function() {
    expect(formBlock.label).toBeDefined();
  });

});
/* jshint ignore:end*/

