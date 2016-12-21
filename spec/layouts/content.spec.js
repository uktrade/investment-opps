/* jshint ignore:start*/
describe('base/content.html content tags', function() {
  var html = render('base/content.html');
  var fields = parseCmsTags(html);
  var formBlock= fields['formBlock'];

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

