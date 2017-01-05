/* jshint ignore:start*/
describe('bullet-list-page.html content tags', function() {
  var html = render('bullet-list-page.html');
  var fields = parseCmsTags(html);
  var formBlock= fields['formBlock'];
  var listItems= fields['listItems'];
  it('should have "formBlock" defined as global content',function() {
    expect(formBlock).toBeDefined();
    expect(formBlock.global).toBe(true);
    expect(formBlock.type).toBe('content');
  });

  it('"formBlock" should have a label defined',function() {
    expect(formBlock.label).toBeDefined();
  });

  it('should have "listItems" defined as multiple content',function() {
    expect(listItems).toBeDefined();
    expect(listItems.multiple).toBe(true);
    expect(listItems.type).toBe('content');
  });

  it('"listItems" should have "link" defined',function() {
    var link = listItems.fields.link;
    expect(link).toBeDefined();
    expect(link.type).toBe('text');
  });



});
/* jshint ignore:end*/

