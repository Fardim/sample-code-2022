import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'pros-geo-location-map',
  templateUrl: './geo-location-map.component.html',
  styleUrls: ['./geo-location-map.component.scss'],
})
export class GeoLocationMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() modalTitle = '';
  @Input() showLocationMap = true;
  @Input() showModalHeader = true;
  @Input() placeholder = 'Search Location';
  @ViewChild('map', { static: false }) mapElement: any;
  @ViewChild('locationSearch', { static: false }) locationSearch: any;
  @ViewChild('searchInput', { static: false }) searchInput: any;

  @Input() mode: 'MAP_MODAL' | 'AUTOCOMPLETE_SEARCHBAR' = 'MAP_MODAL';

  // details of place selected place from autocomplete search
  @Output() placeChanged: EventEmitter<google.maps.places.PlaceResult> = new EventEmitter();

  private _googleMapsApiScriptElement = null;

  submitted = false;
  center = { lat: 0, lng: 0 };
  mapScript: any;
  // using for get place details
  geoCoder: any;
  googleMap: any;
  infoWindow: any;
  marker: any;
  autoCompleteList: any;
  // current module
  moduleId = '';

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  private _loadGoogleMapsApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof google.maps !== 'undefined') resolve();
        else throw Error('gooogle.maps is undefined');
      } catch (err) {
        console.log(err.message + 'attempt appending google maps api script');
        const _googleMapsApiScriptElement = this._document.createElement('script');
        this._renderer2.appendChild(this._document.body, _googleMapsApiScriptElement);
        _googleMapsApiScriptElement.async = true;
        _googleMapsApiScriptElement.onload = () => {
          this._googleMapsApiScriptElement = _googleMapsApiScriptElement;
          resolve();
        };
        _googleMapsApiScriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${environment.mapApi}&libraries=places`;
      }
    });
  }
  ngOnInit(): void {
    this.getRouteParamsInfo();
  }

  getRouteParamsInfo() {
    this.activatedRoute.params.subscribe((paramsData) => {
      this.moduleId = paramsData.moduleId;
    });
  }

  ngAfterViewInit() {
    this._loadGoogleMapsApiScript().then(() => this.initializeMap());
  }

  initializeMap() {
    // new google.maps.places.AutocompleteService().getPlacePredictions({ input: '821-843' }, console.log);
    setTimeout(() => {
      switch (this.mode) {
        case 'AUTOCOMPLETE_SEARCHBAR': {
          this.attachAutocompleteList((place) => this.placeChanged.emit(place));
          break;
        }
        case 'MAP_MODAL': {
          this.getRouteParamsInfo();
          this.googleMap = new google.maps.Map(this.mapElement?.nativeElement, {
            zoom: 15,
            center: this.center,
          });
          this.getUserCurrentLocation();
          this.attachAutocompleteList((place) => this.checkForPlacesChange(place));
          this.checkForMapClick();
          break;
        }
        default: {
          throw Error('Geolocation Map component: mode is undefined');
        }
      }
    });
  }

  attachAutocompleteList(callback: (place: google.maps.places.PlaceResult) => any) {
    this.autoCompleteList = new google.maps.places.Autocomplete(this.locationSearch?.nativeElement);
    this.autoCompleteList.addListener('place_changed', () => callback(this.autoCompleteList.getPlace()));
  }

  checkForMapClick() {
    google.maps.event.addListener(this.googleMap, 'click', (event) => {
      this.marker.setMap(null);
      this.addMarker(event.latLng, this.googleMap);
    });
  }

  /**
   * Add marker to selected place on map
   */
  addMarker(location: google.maps.LatLngLiteral, gMap: google.maps.Map) {
    this.marker = new google.maps.Marker({
      position: location,
      map: gMap,
    });

    this.getPlaceIdBasedOnMarker();
  }

  getPlaceIdBasedOnMarker() {
    const geocoder = new google.maps.Geocoder();
    const latitude = this.marker.getPosition().lat();
    const longitude = this.marker.getPosition().lng();
    const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    const that = this;
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          that.getPlaceDetails(results[1].place_id);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  getPlaceDetails(placeid) {
    const request = {
      placeId: placeid,
      fields: ['name', 'formatted_address', 'place_id', 'geometry'],
    };
    const map = this.googleMap;

    const infoWindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);

    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
        google.maps.event.addListener(this.marker, 'click', () => {
          if (place) {
            // show place details on infowindow of marker
            const content = document.createElement('div');
            const nameElement = document.createElement('h2');
            nameElement.textContent = place?.name;
            content?.appendChild(nameElement);
            const placeAddressElement = document.createElement('p');
            placeAddressElement.textContent = place?.formatted_address;
            content.appendChild(placeAddressElement);
            infoWindow.setContent(content);
            infoWindow.open(this.googleMap, this.marker);
          }
        });
      }
    });
  }

  /**
   * this will check for selected autocomplete option
   */
  checkForPlacesChange(place) {
    this.placeChanged.emit(place);
    this.marker.setMap(null);

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    if (place) {
      if (!place.geometry || !place.geometry.location) {
        console.log('Returned place contains no geometry');
        return;
      }

      // Create a marker for each place.
      const map = this.googleMap;
      this.center = place.geometry.location;

      this.marker = new google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location,
      });

      map.setCenter(this.center);
      this.marker.setMap(map);

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    }
    this.googleMap.fitBounds(bounds);
  }

  getUserCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      this.marker = new google.maps.Marker({
        position: this.center,
        map: this.googleMap,
      });

      this.googleMap.setCenter(this.center);
      this.marker.setMap(this.googleMap);
    });
  }

  close(isSaveClicked: boolean) {
    this.router.navigate([{ outlets: { sb: null, outer: null } }], {
      queryParamsHandling: 'preserve',
    });
  }

  ngOnDestroy() {
    this._renderer2.removeChild(this._document.body, this._googleMapsApiScriptElement);
  }
}
