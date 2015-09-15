/**
 * This class is a subset of QiDisplay that fetches the image from a Qi Response object (API). Split off so it can be used
 * in other classes.
 * @param qiResponseObject
 * @constructor
 */

var QiImage = function(qiResponseObject) {
    this.item = qiResponseObject;
    this.image_server = 'https://zilver.qi-cms.com/media/_source/'; /* URL of the server containing the images; server + path = src of the image */
    this.img = this.getImage();
};

/**
 Function to get an image object of the following form from a QI API Response (this.item):
 {
 src
 alt
 id
 }
 @return object (attributes are empty ('' not undefined) when no image could be found)
 */
QiImage.prototype.getImage = function () {
    var images = this.item.media.image;
    var image_list = [];
    if (!images instanceof Array || typeof(images) == 'undefined') {
        return image_list;
    }
    //for (var i = 0; i < images.length; i++) {
    for (var i = 0; i < 1; i++) { /* We only need one image */
        var image = images[i];
        var image_object = {
            src: '',
            alt: '',
            id: ''
        };
        image_object.src = this.image_server + image.path + '/' + image.filename;
        if (typeof (image.alt_text) != 'undefined' && image.alt_text != '') {
            image_object.alt = image.alt_text;
        } else if (typeof (image.caption) != 'undefined' && image.caption != '') {
            image_object.alt = image.caption;
        } else {
            /* Fallback */
            image_object.alt = image.filename;
        }
        image_object.id = image.filename;
        image_list.push (image_object);
    }
    if (image_list.length == 0) {
        /* No image, return empty object */
        return {
            src: '',
            alt: '',
            id: ''
        };
    }
    return image_list[0];
};
