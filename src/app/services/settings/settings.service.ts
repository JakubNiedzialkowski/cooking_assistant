import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { TtsManagerService } from '../../services/ttsManager/tts-manager.service';

export interface Settings {
  isTtsEnabled: boolean,
}

const SETTINGS_KEY = "app_settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {


  constructor(private storage: Storage,
    private tts: TtsManagerService) {
    this.startService();
  }

  startService() {
    this.getSettings().then((settings: Settings) => {
      if (!settings)
        this.initializeSettings();
      else
        this.applySettings(settings);
    });
  }

  getSettings() {
    return this.storage.get(SETTINGS_KEY);
  }

  updateSettings(Settings: Settings) {
    this.storage.set(SETTINGS_KEY, Settings);
    this.applySettings(Settings);
  }

  initializeSettings() {
    var Settings = {
      isTtsEnabled: true,
    }
    this.storage.set(SETTINGS_KEY, Settings);
  }

  applySettings(settings: Settings) {
    if (settings.isTtsEnabled)
      this.tts.enableService();
    else
      this.tts.disableService()
  }

}
