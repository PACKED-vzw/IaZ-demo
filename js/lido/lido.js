/**
 * Created by pieter on 1/07/15.
 */
var lido = angular.module ('simpleCollectionView.lido', ['simpleCollectionView.services']);


lido.factory ('LIDODisplay', function () {
    var LIDODisplay = function (lido) {
        this.lido = lido;
        this.helper = new SearchDisplay();
        this.lido_events = new LIDOEvents(this.lido);
        this.lido_metadata = new LIDOMetadata(this.lido);
        this.exportItem = {};
        this.item = {
            img: this.lido.administrativeMetadata.resourceWrap.resourceSet.resourceRepresentation
        };
        this.metadata = {
            types: this.lido_metadata.object_type,
            measurements: this.lido_metadata.measurements,
            repository: this.lido_metadata.repository,
            subjects: this.lido_metadata.subjects
        };
        this.title = this.lido_metadata.title;
        this.collections = this.lido_metadata.collections;
        this.img = {
            src: '',
            alt: this.title
        };

    };

    /*
     Convert the currently wrapped properties to strings or arrays of strings for display
     */
    LIDODisplay.prototype.formatDisplay = function () {
        this.getLargeImage ();
        this.img.alt = this.title;
    };
    /*
     Get the "large" image
     */
    LIDODisplay.prototype.getLargeImage = function () {
        for (var i = 0; i < this.item.img.length; i++) {
            if (this.item.img[i].type == 'large' || this.item.img[i].type == 'original') {
                this.img.src = this.item.img[i].linkResource.value;
                break;
            }
        }
        if (this.img.src == '') {
            this.img.src = 'view/css/Ehem_Baudenkmal.svg.png';
        }
    };

    /*
     Get the "thumb" image
     */
    LIDODisplay.prototype.getThumbImage = function () {
        for (var i = 0; i < this.item.img.length; i++) {
            if (this.item.img[i].type == 'thumb') {
                this.img.src = this.item.img[i].linkResource.value;
                break;
            }
        }
        if (this.img.src == '') {
            this.img.src = 'view/css/Ehem_Baudenkmal.svg.png';
        }
    };
    /*
     Divide this.records in chunks (pages) of 60 items for continous display
     */
    LIDODisplay.prototype.paginate = function () {
        var paginated = this.helper.chunk (this.records, 60);
        this.paginated = paginated;
        return paginated;
    };

    LIDODisplay.prototype.exportData = function () {
        this.exportItem.metadata = this.metadata;
        this.exportItem.img = this.img;
        this.exportItem.title = this.title;
        this.exportItem.collections = this.collections;
        this.exportItem.events = this.lido_events.events;
        this.exportItem.stringmetadata = this.stringmetadata;
    };
    return LIDODisplay;
});