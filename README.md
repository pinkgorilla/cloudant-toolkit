
# cloudant-toolkit
`cloudant-toolkit` is a wrapper library for `cloudant`. this library overrides some method implementation of `cloudant` please refer to overridden methods section for more details.

---
## **Installation**
```
npm install cloudant-toolkit
```
---
## **Usage**
```javascript
var Cloudant = require('cloudant-toolkit');
var db;
Cloudant(connectionString , function(err, cloudant){
	if(err)
		throw err;
	db = cloudant.use('your-table')	
});
```
---
## **Executable methods**
executable methods are methods that will immediately executed against the `query`. See **Query methods** sections.

### execute()
load data with build up query. if no query is build, it will return data with `{_id:{$gt:0}}` as criteria.

**returns**
Promise
	
```javascript 
	db
		.execute()
		.then(docs=>{
			// Process your docs here.
		})
		.catch(e=>{
			// Handle your error here.
		});
```	

---
### single(*[selector]*)
get a single data, throw exception if no data returned or the returned data is more than one. If no query is build, it will use`{_id:{$gt:0}}` as selector.

**parameters**

 - **selector** - *optional*, `cloudant` [selector syntax][selector-syntax].
		
**returns**
Promise
	
```javascript 
	db
		.single({_id: someId})
		.then(docs=>{
			// Process your docs here.
		})
		.catch(e=>{
			// Handle your error here.
		});
```	
  
---
### singleOrDefault(*[selector]*)
get a single data, throw exception if n returned data is more than one. If no query is build, it will use`{_id:{$gt:0}}` as selector.

**parameters**

 - **selector** - *optional*, `cloudant` [selector syntax][selector-syntax].
		
**returns**
Promise
	
```javascript 
	db
		.single({_id: someId})
		.then(docs=>{
			// Process your docs here.
		})
		.catch(e=>{
			// Handle your error here.
		});
```	

---
### first(*[selector]*)
get first data, throw exception if no data returned or the returned data is more than one. If no query is build, it will use`{_id:{$gt:0}}` as selector.

**parameters**

 - **selector** - *optional*, `cloudant` [selector syntax][selector-syntax].
		
**returns**
Promise
	
```javascript 
	db
		.first({_id: {$gt:0}})
		.then(docs=>{
			// Process your docs here.
		})
		.catch(e=>{
			// Handle your error here.
		});
```	
 
---
### firstOrDefault(*[selector]*)
get first data, throw exception if n returned data is more than one. If no query is build, it will use`{_id:{$gt:0}}` as selector.

**parameters**

 - **selector** - *optional*, `cloudant` [selector syntax][selector-syntax].
		
**returns**
Promise
	
```javascript 
	db
		.firstOrDefault({_id: {$gt:0}})
		.then(docs=>{
			// Process your docs here.
		})
		.catch(e=>{
			// Handle your error here.
		});
```	

---
## **Query methods**
these methods returns `Db` object.  you can chain these methods to build up your query and then call `execute` method to get the result.

### where (*selector*)
query data with selector

**parameters**

 - **selector** - *`cloudant` [selector syntax][selector-syntax]*
	criteria to query.
		
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.execute()
```	

---
### skip (*offset*)
skip the first N result.

**paramete	rs**

 - **offset** - offset to start return data from.
		
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.skip(10)
		.take(10)
		.execute()
```	

---
### take (*size*)
set number of results to return.

**parameters**

 - **size** - number of results to get
		
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.skip(10)
		.take(10)
		.execute()
```	

---
### page (*page* ,*size*)
data pagination, shorthand for `skip` and `take`.

**parameters**

 - **page** - 1 based index.
 - **size** - number of results to get
		
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.page(2 , 10)
		.execute()
```	

---
### orderBy (sort)
sort results, please refer to [sort syntax][sort-syntax] for more detail.

**parameters**

 - **sort** - `cloudant` sort syntax. 
 
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.page(2 , 10)
		.execute()
```	

---
### select (fields)
return result with specified fields.

**parameters**

 - **fields** - array of string. 
 
**returns**
Db
	
```javascript 
	db
		.where({_id:{$gt:0}})
		.page(2 , 10)
		.select(['id', 'name', 'age'])
		.execute()
```	

---
## **Overridden methods**
here is a list of overridden methods by this library. you can always use `cloudant` implementation by prefixing the method with underscore `_`

- **insert** - *use **_insert** to use `cloudant` implementation*.

---
## **Dependencies**
- [cloudant][cloudant]
[cloudant]:https://github.com/cloudant/nodejs-cloudant
[selector-syntax]:https://docs.cloudant.com/cloudant_query.html#selector-syntax
[sort-syntax]:https://docs.cloudant.com/cloudant_query.html#sort-syntax