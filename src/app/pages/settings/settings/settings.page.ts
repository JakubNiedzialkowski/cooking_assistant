import { Component, OnInit } from '@angular/core';

import { SettingsService, Settings } from 'src/app/services/settings/settings.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  settings: Settings;

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.settingsService.getSettings().then((savedSettings:Settings) =>{
      this.settings = savedSettings;
    });
  }

  applyChanges(){
    this.settingsService.updateSettings(this.settings);
  }

}
