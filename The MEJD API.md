# The MEJD API
The MEJD API is a (mostly) [RESTful service](https://en.wikipedia.org/w/index.php?title=Representational_state_transfer&oldid=689372283) provided by the [MEJD](http://www.provincieantwerpen.be/aanbod/dcul/zilver-diamant.html) as a public interface on their collection management system (built upon [QI](http://keepthinking.it/qi)).


## Style conventions in this document
`code` is always formatted in monospace in a grey rectangle.

>Examples are always in block quotes.

record, item, object

# Access to the API
The API is account-based, so you will need an user account and password. Contact the MEJD to get one.

# Documentation

## Endpoints
The API has a single endpoint at [https://zilver.qi-cms.com/api/](https://zilver.qi-cms.com/api/). All requests must be sent to this URL. Note that it uses HTTPS and not HTTP.

## Data format
All data is returned as [JSON](https://en.wikipedia.org/w/index.php?title=JSON&oldid=689636482). `PUT` and `POST` requests also use JSON. For `GET` requests the use of XML is also supported. To return XML, add `_format/xml` to your request.
> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/id/1743/_format/xml`

## Query types
2 query types: return a list or a single item

### List
paged
### Single item

## Parameters
### URL
The URL is formed according to the following pattern: `https://zilver.qi-cms.com/api/request_method/qi_type/additional/parameters`.

### Authentication
The API is stateless. In every request you have to provide your username and password using [HTTP Basic Authentication](https://en.wikipedia.org/w/index.php?title=Basic_access_authentication&oldid=677742727) over [HTTPS](https://en.wikipedia.org/w/index.php?title=HTTPS&oldid=689221097).

### Request methods
The API supports all 4 common request methods: `GET`, `POST`, `PUT` and `DELETE`. Apart from using the correct method, you also need to include it in the URL.
> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/id/1743`

### Request parameters
#### _offset
Start fetching objects from the offset number. The offset is between 0 and the total amount of records returned. You can find the total amount of records in the `count` attribute of the returned data.
> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/_offset/25`

#### _per\_page
For list queries: the amount of records to be returned on a single page. The default (and maximum) is 500.
> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/_per_page/250`

#### _format
For `GET` queries: the format of the result set. Can be JSON or XML.
> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/_format/xml`

#### _approve
When changing records (`PUT`, `POST` or `DELETE`) approve the changes. Can only be done by a user with the "approve" rights. Value can be `yes` or `no`.
> `curl -u user:pass -X PUT -d '{ "id": "1743", "name": "S95/7 - Doos 9596 }' https://zilver.qi-cms.com/api/get/object/_approve/yes`

## Data model
The data model of the result is dependent on the data model inside QI of the type you have requested. Types are created by the MEJD and are specific for this instance of QI. For more information on more esoteric parts of the model, you'll have to contact the MEJD.

### Types
Types are the most specific object that can be queried using the API. QI consists of objects that are connected by relationships. Any of those objects may be queried separately, but relations may not; they are always an attribute in all the connected objects. Types correspond to both the main modules visible in the QI interface and to the controlled vocabularies visible in QI.

A list of types may be requested by querying the URL `https://zilver.qi-cms.com/api/get/types`. This result contains all supported types as single objects inside a wrapper object. Every type is an attribute of this wrapper object, with the name of the type the name of the attribute.

This list of types contains the definition for every type used in this instance, its fields and its relationships. They are designed to be self-explanatory. We will cover the basic attributes of these definitions and in a subsequent chapter cover the fields and relationships for the 'object' record type in more detail.

>
	{
		object: {
			id: "1",
			type: "content",
			table: "object",
			name: "Objects",
			is_content: 1,
			fields: [
				{
					name: "name",
					label: "Label",
					validation_rules: "",
					help: null,
					type: "calculated",
					source_type_id: null,
					source_node_ids: null
				}
				...
			],
			nodes: [
				{
					id: "1",
					name: "Collection"
				}
			],
			links: [
				{
					id: "3",
					relationship: "object_object",
					relationship_type: "many_to_many",
					relationship_type_id: "239",
					fields: [
						{...}
					]
				}
			]
		}
	}

#### Structure of the object
	{
		id: "number",
		name: "string",
		fields: [
			{...}
		],
		nodes: [
			{...}
		],
		links: [
			{...}
		]
	}

The attribute `id` contains the id of this type.

The attribute `fields` contains an array of all supported fields as objects.

The attribute `nodes` contains the id and name of the node (QI is layered, with nodes forming the top layer and objects the bottom layer) this object belongs to.

The attribute `links` contains an array of objects identifying the relationships between this object and other objects that have either extra attributes or are of the type one-to-many or many-to-many.

#### Structure of the `field` object
	{
		name: "string",
		label: "string",
		validation_rules: "string",
		help: "string",
		type: "string",
		source_type_id: "string",
		source_node_ids: ?
	}

The `name` is the system name for the field, the `label` contains the human-readable variant.

The `type` attribute contains the type of the field. The main types are

* `text`
* `date`: an [ISO 8601](https://en.wikipedia.org/w/index.php?title=ISO_8601&oldid=689001139) date.
* `date_flexible`: a textual date that has not been converted to ISO 8601.
* `textarea`
* `select`: a reference to an other type that is used in a one-to-one relationship without extra attributes. Relationships that have attributes or are one-to-many or many-to-many are documented in the `links` attribute of the containing type.

The `source_type_id` attribute contains the ID of the type the relationship this field refers to. Most fields that are relationships are of the type `select`.

#### Structure of the `link` object
	{
		id: "number",
		relationship: "string",
		relationship_type: "many_to_many",
		relationship_type_id: "number",
		fields: [
			{...}
		]
	}

A relationship may have fields. Those fields are of the same structure as the `field` object referenced above.

### Getting data
All data returned is always wrapped inside an object containing two attributes: `count` and `records`. `count` is the total amount of records that are returned as the result of the query. `records` contains an array of either all the records in the result set or a subset if the total amount of results exceeds 500.
> Executing `curl -u user:pass https://zilver.qi-cms.com/api/get/object` returns:
>
	{
		count: 11394,
		records: [
			{...}
		]
	}

#### Results of query
All queries return a list. Queries can be for all items of a single type, or of all items of a single type that have an attribute with a specific value.

Queries for all items of a single type use an url of the form `https://zilver.qi-cms.com/api/get/_type_`.

Queries for all items having an attribute with a value use an url of the form `https://zilver.qi-cms.com/api/get/_type_/_attribute_/_value_`.

> `curl -u user:pass https://zilver.qi-cms.com/api/get/object/id/1743` queries for all items of type `object` that have the attribute `id` with the value `1743`. The result is partially displayed below.

>
	{
		"count": ​1,
		"records": 
		[
			{
				"id": "1743",
			    "type_id": "1",
			    "node_id": "1",
			    "name": "S95/7 - Doos 9596",
			    "table": "object",
			    "reference": "s957",
			    "type_name": "Objects",
			    "online": "1",
			    "created_on": "2014-05-25 11:13:26",
			    "created_by_id": "2",
			    "updated_on": null,
			    "updated_by_id": null,
			    "record": {
				    "object_number": "S95/7",
				    "collection_type_id": null,
				    "collection_type_value": "",
				    "collection_type_reference": "",
				    "object_type_id": "125",
				    "object_type_value": "Edelsmeedwerk",
				    "object_type_reference": null,
				    "number_parts": "",
				    "number_copies": "1",
				    "copy": null,
				    "part": null,
				    "part_number": "",
				    "object_style_id": "197",
				    "object_style_value": "Art Deco",
				    "object_style_reference": "art-deco",
				    "location_id": null,
				    "location_value": "",
				    "location_reference": "",
				    "name": "S95/7 - Doos 9596",
				    "object_short_description": "",
				    "mark_arrangement": "",
				    "acquisition_note": "",
				    "ownership_note": "",
				    "loan_condition": "",
				    "condition_note": "",
				    "reference_note": "",
				    "valuation_note": "",
				    "insurance_note": "",
				    "ipr_status_id": "4",
				    "ipr_status_value": "Publiek domein",
				    "ipr_status_reference": "publiek-domein",
				    "rights_start_date": "",
				    "rights_end_date": "",
				    "rights_statement": ""
				},
				"relationship": {
				    "object_maker": [
				    	{
						    "id": "258",
						    "target_id": "1102",
						    "name": "Altenloh, Ernest & Robert",
						    "online": "1",
						    "deleted": "0",
						    "rank": null,
						    "target_type_id": "5",
						    "target_is_content": "1",
						    "version_id": "1",
						    "target_deleted": "0",
						    "target_online": "1",
						    "target_node_id": "1",
						    "details":
						    {
						        "actor_role_id": "52",
						        "actor_role_id_name": "Vervaardiger"
						    },
						    "link_config_id": "49"
						}
					]
				}
				"media": {
					"image": [
						{
							"id": "192",
							"path": "stercksh/zilver/1995",
							"filename": "s9500701.jpg",
							"original_filename": "s9500701.jpg",
							"relative_path": "stercksh/zilver/1995/s9500701.jpg",
							"name": "P:\\MUSAE\\beelden\\stercksh\\zilver\\1995\\S9500701.jpg",
							"media_type": "image",
							"media_folder_id": "7",
							"extension": "jpg",
							"caption": null,
							"alt_text": null,
							"credits": null,
							"copyright": null,
							"keywords": null,
							"in_library": "1",
							"online": "1",
							"deleted": null,
							"width": "1024",
							"height": "768",
							"filesize": "60474",
							"created_on": "1401012837",
							"created_by_id": "2",
							"updated_on": null,
							"updated_by_id": null,
							"media_folder_name": "stercksh/zilver/1995",
							"media_folder_rank": null,
							"password_protected": null,
							"media_catalogue_id": "1",
							"catalogue_name": "Objecten",
							"link_name": "",
							"link_caption": null,
							"link_alt_text": null,
							"link_online": "1",
							"link_deleted": null,
							"link_id": "2",
							"rank": null,
							"source_id": "1743",
							"permission": 
							{
							    "right": "3",
							    "width": "99999",
							    "height": "99999"
							}
						}
					]
				}
			}
		]
	}


##### Record
The `record` attribute contains an object representing the item that was requested. All attributes of this object are the fields as they are defined in the type definition of the item requested (see _Types_ in this Manual).

###### On `select` fields
When a field is of the type `select`, the result contains apart from the field, two other fields related to the `select` field.

* _fieldname_`_value` (where _fieldname_ is the name of the `select` field without `_id`): contains a human-readable representation of the object that is referred to by this relationship.
* _fieldname_`_reference`: contains a reference (generated) to the referred-to object.


##### Relationships
All relationships are objects, contained in an object with the name of the relationship as attribute. As there may be multiple relationships with the same name, the relationship objects are within an array.

Most useful information is in the attribute `details`. The exact definition of the used fields is in the `links` attribute of the type definition of the queried item or in the `fields` attribute of the type definition of the item linked to.

##### Media
Images are objects inside arrays inside the `image` attribute of the `media` object.

The `caption` attribute contains the caption of the image.

To display an image (e.g. inside a web application), use the attribute `relative_path` and add to the URL `https://zilver.qi-cms.com/media/_source/`. Deeplinking images is possible (no login is needed), but permission may required. Contact the MEJD for more information.

> e.g. `<img src="https://zilver.qi-cms.com/media/_source/stercksh/zilver/1995/s9500701.jpg" alt="_caption_" >`

##### Queries resulting in results with more than one item
While all queries return the same object (with `count` and `records` attributes), when the result contains more than one item, the record-objects (inside `records`) have fewer data.

>
	{
		 "count": ​11394,
	    "records": [
			{
		    "id": "1743",
		    "type_id": "1",
		    "node_id": "1",
		    "name": "S95/7 - Doos 9596",
		    "table": "object",
		    "reference": "s957",
		    "type_name": "Objects",
		    "online": "1",
		    "created_on": "2014-05-25 11:13:26",
		    "created_by_id": "2",
		    "updated_on": null,
		    "updated_by_id": null
			},
			{
		    "id": "1744",
		    "type_id": "1",
		    "node_id": "1",
		    "name": "S57/2 - Wijwaterbakje",
		    "table": "object",
		    "reference": "s572",
		    "type_name": "Objects",
		    "online": "1",
		    "created_on": "2014-05-25 11:13:26",
		    "created_by_id": "2",
		    "updated_on": null,
		    "updated_by_id": null
			}
		]
	}

## Updating the data
All non-`GET` requests must use JSON as data format. Changes must be approved before they are "live". This can be done in the interface or by adding `_approve/yes` to the URL.

### Creating new records
To create a new record, use a `POST` request to the type you want to create. The data must be JSON and must use the fields and relationships defined in _Types_. The `id` of the created record is returned. The URL is of the form `https://zilver.qi-cms.com/api/post/_type_`.

> `curl -u user:pass -X POST -d '{ "name": "S95/7 - Doos 9596" }' https://zilver.qi-cms.com/api/post/object`

You must make sure that all required elements (shown in `validation_rules` in the type definition) are provided when creating a new record, or an error will be generated.

### Updating existing records
To update a record, use `PUT` request to the type you want to update. Include in the data the `id` field containing the id of the item you want to update. The URL is of the form `https://zilver.qi-cms.com/api/put/_type_`.

> `curl -u user:pass -X PUT -d '{ "id": "1743", "name": "S95/7 - Doos 9596" }' https://zilver.qi-cms.com/api/put/object`

As with creating a new record, the data must be in JSON and must use the fields and relationships defined in _Types_. Required fields must be provided.

### Deleting records
Execute a `DELETE` request to the item you want to delete. The URL is of the form `https://zilver.qi-cms.com/api/delete/_type_/id/_id_`.

> `curl -u user:pass -X DELETE https://zilver.qi-cms.com/api/delete/object/id/1743`