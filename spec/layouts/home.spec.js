/* jshint ignore:start*/
describe('Home.html content tags', function() {
  var html = render('home.html');
  var fields = parseCmsTags(html);
  var firstSection = fields['firstSection'];
  var tileItems= fields['tileItems'];
  var listItems= fields['listItems'];
  var listHeader = fields['listHeader'];

  it('should have "firstSection" defined as content',function() {
    expect(firstSection).toBeDefined();
    expect(firstSection.type).toBe('content');
  });

  it('should have "listHeader" defined as content',function() {
    expect(listHeader).toBeDefined();
    expect(listHeader.type).toBe('content');
  });

  it('should have "tileItems" defined as multiple content',function() {
    expect(tileItems).toBeDefined();
    expect(tileItems.multiple).toBe(true);
    expect(tileItems.type).toBe('content');
  });

  it('should have "tileItems" with thumbnail and link',function() {
    var thumbnail = tileItems.fields.thumbnail;
    var link= tileItems.fields.link;
    expect(thumbnail).toBeDefined();
    expect(link).toBeDefined();
    expect(thumbnail.type).toBe('text');
    expect(link.type).toBe('text');
  });

  it('should have "listItems" defined as multiple content',function() {
    expect(listItems).toBeDefined();
    expect(listItems.multiple).toBe(true);
    expect(listItems.type).toBe('content');
  });

  it('should have "listItems" with link',function() {
    var link= listItems.fields.link;
    expect(link).toBeDefined();
    expect(link.type).toBe('text');
  });



});
/* jshint ignore:end*/

