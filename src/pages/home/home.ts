import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, Events } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { BeaconModel } from '../../models/beacon-model';
import { BeaconProvider } from '../../providers/beacon/beacon';
import { DomSanitizer } from '@angular/platform-browser';
declare var evothings: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

// export class HomePage {

//   constructor(public navCtrl: NavController, public ibeacon: IBeacon) {

//     // Request permission to use location on iOS
//     this.ibeacon.requestAlwaysAuthorization();
//     // create a new delegate and register it with the native layer
//     let delegate = this.ibeacon.Delegate();

//     // Subscribe to some of the delegate's event handlers
//     delegate.didRangeBeaconsInRegion()
//       .subscribe(
//         data => console.log('didRangeBeaconsInRegion: ', data),
//         error => console.error()
//       );
//     delegate.didStartMonitoringForRegion()
//       .subscribe(
//         data => console.log('didStartMonitoringForRegion: ', data),
//         error => console.error()
//       );
//     delegate.didEnterRegion()
//       .subscribe(
//         data => {
//           console.log('didEnterRegion: ', data);
//         }
//       );

//     let beaconRegion = this.ibeacon.BeaconRegion('iBeacon', '00000000-0000-0000-0000-000000000ABC');

//     this.ibeacon.startMonitoringForRegion(beaconRegion)
//       .then(
//         () => console.log('Native layer recieved the request to monitoring'),
//         error => console.error('Native layer failed to begin monitoring: ', error)
//       );
//   }

// }
export class HomePage {

  beacons: BeaconModel[] = [];
  beaconList: any = [];
  zone: any;
  list: any = [];
  beacon: any;
  dataList: any = [];
  url: any;
  selectedId: any;
  width: any;
  height: any;
  isOutofRange: boolean;

  constructor(public navCtrl: NavController, public platform: Platform, private sanitizer: DomSanitizer, public beaconProvider: BeaconProvider, public events: Events, private change: ChangeDetectorRef) {
    // required for UI update
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.dataList = [{
      id: 2796,
      url: "http://www.piqotech.com"
    }];
    this.width = window.screen.width;
    this.height = window.screen.height - 30;
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.beaconProvider.initialise().then((isInitialised) => {
        if (isInitialised) {
          this.listenToBeaconEvents();
        }
      });
      this.startScan();
    });
  }

  startScan() {
    evothings.eddystone.startScan((beaconData) => {
      this.beacon = beaconData;
      console.log(this.beacon);
      setTimeout(() => {
        this.change.detectChanges();
      }, 500);
    }, error => {
      console.error(error);
    })
  }

  updateList() {
    let timeNow = Date.now();
    this.list = []
    for (let key in this.beaconList) {
      // Only show beacons updated during the last 60 seconds.
      let beacon = this.beaconList[key];
      if (beacon.timeStamp + 60000 < timeNow) {
        delete this.beaconList[key];
      } else {
        this.list.push(this.beaconList[key]);
      }
    }
  }

  removeBeacon() {
    let timeNow = Date.now();
    for (let key in this.beaconList) {
      // Only show beacons updated during the last 60 seconds.
      let beacon = this.beaconList[key];
      if (beacon.timeStamp + 60000 < timeNow) {
        delete this.beaconList[key];
      }
    }
  }

  updateBeacons(beacon) {
    beacon.timestamp = Date.now();
    let timeNow = Date.now();
    if (beacon.timeStamp + 60000 < timeNow) {

    }
  }

  listenToBeaconEvents() {
    this.events.subscribe('didRangeBeaconsInRegion', (data) => {

      console.log("Beacon Data:::"+JSON.stringify(data));

      // update the UI with the beacon list
      this.zone.run(() => {

        this.beacons = [];

        this.beaconList = data.beacons;
        if (this.beaconList.length) {
          this.isOutofRange = false;
          this.beaconList.forEach((beacon) => {
            let beaconObject = new BeaconModel(beacon);
            this.beacons.push(beaconObject);
          });
          this.getLocation();
        } else {
          setTimeout(() => {
            this.isOutofRange = true;            
          }, 4000);
        }
      });

    });
  }

  getLocation() {
    this.beacons.forEach((beacon) => {
      this.dataList.forEach(data => {
        if (data.id === beacon.major && data.id !== this.selectedId) {
          this.selectedId = data.id;
          this.url = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
        }
      });
    });
  }

}
