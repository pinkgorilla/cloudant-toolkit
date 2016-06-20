var Cloudant = require('cloudant');
var Query = require('./query');


Array.prototype.distinct = function () {
    var n = {}, r = [];
    for (var i = 0; i < this.length; i++) {
        if (!n[this[i]]) {
            n[this[i]] = true;
            r.push(this[i]);
        }
    }
    return r;
};

module.exports = function (credential, callback) {
    var dbList = [];
    var nano = Cloudant(credential, callback);

    function use(db, opts) {
        return new Promise((resolve, reject) => {
            var obj = nano.__use(db);
            extend(obj);

            var options = Object.assign({ autoCreate: true }, opts);

            nano.exists(db)
                .then(exists => {
                    if (exists) {
                        resolve(obj);
                    }
                    else {
                        if (!options.autoCreate)
                            reject('db named ' + db + ' does not exist.');
                        else {
                            nano.db.create(db, (err, data) => {
                                if (err)
                                    reject(err);
                                else {
                                    resolve(obj);
                                }
                            })
                        }
                    }
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    function exists(db) {
        return new Promise((resolve, reject) => {
            if (dbList.length < 1) {
                var fnList = this.list || this.db.list;
                fnList((err, dbs) => {
                    if (err)
                        reject(err);
                    else {
                        dbList = dbList.concat(dbs.map(element => element.toLowerCase()));
                        resolve(dbList.indexOf(db.toLowerCase()) > -1);
                    }
                });
            }
            else
                resolve(dbList.indexOf(db.toLowerCase()) > -1);
        })
    }

    function __stripCriteriaFromQuery(query) {
        var props = [];
        for (var property in query) {
            //ex: $and:[{prop1:1},{prop2:'value2'}]
            if (property.indexOf('$') > -1 && query[property] instanceof Array) {
                for (var subquery of query[property])
                    props = props.concat(__stripCriteriaFromQuery(subquery));
            }
            else {
                props.push(property.toLowerCase());
            }
        }
        return props.distinct().sort();
    }

    function dbIndexes() {
        return new Promise((resolve, reject) => {
            if (Object.keys(this._indexes).length > 0)
                resolve(this._indexes);
            else {
                this.dbLoadIndexes()
                    .then(indexes => {
                        resolve(indexes);
                    })
                    .catch(e => {
                        reject(e);
                    })
            }
        });
    }

    function dbLoadIndexes() {
        return new Promise((resolve, reject) => {
            this.index((err, result) => {
                if (err)
                    reject(err);
                else {
                    for (var index of result.indexes)
                        this._indexes[index.name] = index;
                    resolve(this._indexes);
                }
            });
        });
    }

    function dbEnsureIndex(query) {
        return new Promise((resolve, reject) => {
            this.dbIndexes()
                .then(indexes => {
                    var criteriaInQuery = __stripCriteriaFromQuery(query);
                    var indexCovered = false;
                    var coveringIndex;

                    for (var indexName in indexes) {
                        var covered = true;
                        var indexFields = indexes[indexName].def.fields.map(el => {
                            return Object.keys(el)[0];
                        }).sort();

                        if (indexFields.toString() == criteriaInQuery.toString()) {
                            coveringIndex = indexName;
                            indexCovered = true;
                            break;
                        }
                    }

                    if (!indexCovered) {
                        var indexDefinition = { index: { fields: [] } };
                        for (var criterion of criteriaInQuery) {
                            indexDefinition.index.fields.push(criterion);
                        }
                        indexDefinition.name = 'idx@' + this.config.db + ':' + indexDefinition.index.fields.join('-');
                        this.index(indexDefinition, (err, response) => {
                            if (err)
                                reject(err);
                            else
                                this.dbLoadIndexes()
                                    .then(indexes => {
                                        resolve(indexes[indexDefinition.name]);
                                    })
                                    .catch(e => {
                                        reject(e);
                                    });
                        });
                    }
                    else {
                        resolve(coveringIndex);
                    }
                })
                .catch(e => {
                    reject(e);
                })
        });
    }


    function single(query) {
        return new Promise((resolve, reject) => {
            if (query)
                this.where(query);

            this.take(2)
                .orderBy([{ _id: 'desc' }])
                .execute()
                .then(docs => {
                    if (docs.length == 0)
                        reject('no document found');
                    else if (docs.length > 1)
                        reject('expected one doc');
                    else
                        resolve(docs[0]);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    function singleOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.single(query)
                .then(doc => {
                    resolve(doc);
                })
                .catch(e => {
                    resolve(null);
                })
        })
    }

    function first(query) {
        return new Promise((resolve, reject) => {
            if (query)
                this.where(query);
            this
                .take(1)
                .execute()
                .then(docs => {
                    if (docs.length == 0)
                        reject('no document found');
                    else
                        resolve(docs[0]);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    function firstOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.first(query)
                .then(doc => {
                    resolve(doc);
                })
                .catch(e => {
                    resolve(null);
                })
        });
    }

    function insert(doc) {
        return new Promise((resolve, reject) => {
            this._insert(doc, (err, result) => {
                if (err)
                    reject(err);
                else
                    if (result.ok)
                        resolve({ _id: result.id, _rev: result.rev });
                    else
                        reject('insert result is not ok');
            })
        })
    }

    function update(doc) {
        return new Promise((resolve, reject) => {
            if (!doc._id || !doc._rev)
                reject('unable to update document without _id and _rev fields.')
            else {
                this.insert(doc)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(e => {
                        reject(e);
                    });
            }
        });
    }

    function _delete(doc) {
        return new Promise((resolve, reject) => {
            if (!doc._id || !doc._rev)
                reject('unable to delete document without _id and _rev fields.')
            else {
                this.destroy(doc._id, doc._rev, (err, result) => {
                    if (err)
                        reject(err)
                    else {
                        if (result.ok)
                            resolve({ _id: result.id, _rev: result.rev });
                        else
                            reject('delete result is not ok');
                    }
                });
            }
        });
    }

    function extend(db) {

        db._indexes = {};
        db.dbIndexes = dbIndexes;
        db.dbLoadIndexes = dbLoadIndexes;
        db.dbEnsureIndex = dbEnsureIndex;

        if (db.insert)
            db._insert = db.insert;
        db.insert = insert;

        if (db.update)
            db._update = db.update;
        db.update = update;

        if (db.delete)
            db._delete = db.delete;
        db.delete = _delete;

        db.single = single;
        db.singleOrDefault = singleOrDefault;

        db.first = first;
        db.firstOrDefault = firstOrDefault;

        db.query = query;
        db.execute = execute;
        db.where = where;
        db.take = take;
        db.skip = skip;
        db.page = page;
        db.orderBy = orderBy;
        db.select = select;
        db.single = single;
        db.singleOrDefault = singleOrDefault;
    }

    function query() {
        if (!this._query) {
            this._query = new Query();
        }
        return this._query;
    }
    function execute() {
        return new Promise((resolve, reject) => {
            var query = this.query();
            this.dbEnsureIndex(query.selector)
                .then(index => {
                    this.find(query, (error, result) => {
                        if (error) {
                            this._query = null;
                            reject(error);
                        }
                        else {
                            this._query = null;
                            resolve(result.docs);
                        }
                    })

                })
                .catch(e => { reject(e); })
        });
    }
    function where(criteria) {
        this.query().where(criteria);
        return this;
    }
    function take(limit) {
        this.query().take(limit);
        return this;
    }
    function skip(skip) {
        this.query().skip(skip);
        return this;
    }
    function page(page, size) {
        this.query().page(page, size);
        return this;
    }
    function orderBy(order) {
        this.query().orderBy(order);
        return this;
    }
    function select(fields) {
        this.query().select(fields);
        return this;
    }

    nano.__use = nano.use;
    nano.collections = nano.use = nano.db.use = use;
    nano.exists = nano.db.exists = exists;
}
