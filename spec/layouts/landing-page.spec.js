/* jshint ignore:start*/
describe('landing-page.html content tags', function() {
  var html = render('landing-page.html');
  var fields = parseCmsTags(html);
  var formBlock = fields['formBlock'];
  var tileItems = fields['tileItems'];
  var subTileItems= fields['subTileItems'];

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

  it('should have "subTileItems" defined as multiple content',function() {
      expect(subTileItems).toBeDefined();
      expect(subTileItems.multiple).toBe(true);
      expect(subTileItems.type).toBe('content');
  });

  it('should have "subTileItems" with thumbnail and link',function() {
      var thumbnail = subTileItems.fields.thumbnail;
      var link= subTileItems.fields.link;
      expect(thumbnail).toBeDefined();
      expect(link).toBeDefined();
      expect(thumbnail.type).toBe('text');
      expect(link.type).toBe('text');
  });

});
/* jshint ignore:end*/

