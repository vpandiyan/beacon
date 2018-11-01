import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBeacon } from '@ionic-native/ibeacon';
import { Events, Platform } from 'ionic-angular';

/*
  Generated class for the BeaconProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BeaconProvider {

  delegate: any;
  region: any;

  constructor(public platform: Platform, public events: Events, public IBeacon: IBeacon) {
  }

  initialise(): any {
    let promise = new Promise((resolve, reject) => {
      // we need to be running on a device
      if (this.platform.is('cordova')) {

        // Request permission to use location on iOS
        this.IBeacon.requestAlwaysAuthorization();

        // create a new delegate and register it with the native layer
        this.delegate = this.IBeacon.Delegate();

        // Subscribe to some of the delegate’s event handlers
        this.delegate.didRangeBeaconsInRegion()
          .subscribe(
            data => {
              this.events.publish('didRangeBeaconsInRegion', data);
            },
            error => console.error()
          );

        // setup a beacon region – CHANGE THIS TO YOUR OWN UUID
        this.region = this.IBeacon.BeaconRegion('deskBeacon', '00000000-0000-0000-0000-000000000ABC');

        // start ranging
        this.IBeacon.startRangingBeaconsInRegion(this.region)
          .then(
            () => {
              resolve(true);
            },
            error => {
              console.error('Failed to begin monitoring: ', error);
              resolve(false);
            }
          );
      } else {
        console.error('This application needs to be running on a device');
        resolve(false);
      }
    });

    return promise;
  }
}
