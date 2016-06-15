var Query = function () {
    this.selector = { _id: { $gt: 0 } };
}

Query.prototype.where = function (criteria) {
    this.selector = criteria;
    return this;
}

Query.prototype.take = function (limit) {
    this.limit = limit;
    return this;
}

Query.prototype.skip = function (skip) {
    this.skip = skip;
    return this;
}

Query.prototype.page = function (page, size) {
    var _page = (page - 1) < 0 ? 0 : (page - 1);
    var _size = size < 1 ? 1 : size;

    this.skip(_page * _size).take(_size);
    return this;
}

Query.prototype.orderBy = function(order){
    this.sort = order;
    return this;
}

Query.prototype.select = function (fields) {
    this.fields = fields;
    return this;
}

Query.prototype.index = function (index) {
    this.use_index = index;
    return this;
}


module.exports = Query;