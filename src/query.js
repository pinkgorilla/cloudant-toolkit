var Query = function() {
    this.selector = {
        _id: {
            $gt: 0
        }
    };
}

Query.prototype.where = function(criteria) {
    this.selector = criteria;
    return this;
}

Query.prototype.take = function(limit) {
    this.limit = limit;
    return this;
}

Query.prototype.skip = function(offset) {
    this.offset = offset;
    return this;
}

Query.prototype.page = function(page, size) {
    var _page = (parseInt(page || '0', 10) - 1) < 0 ? 0 : (parseInt(page || '0', 10) - 1);
    var _size = parseInt(size || '1', 10) < 1 ? 1 : parseInt(size || '1', 10);

    this.skip(_page * _size).take(_size);
    return this;
}

Query.prototype.orderBy = function(field, asc) {
    this.sort = [{}];
    this.sort[0][field] = (asc || 'true').toString().toLowerCase() === 'true' ? 'asc' : 'desc';;
    return this;
}

Query.prototype.select = function(fields) {
    this.fields = fields;
    return this;
}

Query.prototype.index = function(index) {
    this.use_index = index;
    return this;
}


module.exports = Query;