package com.msupplymobile;

import io.realm.react.RealmReactPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.rnfs.RNFSPackage;
import com.artirigo.fileprovider.RNFileProviderPackage;
import com.benwixen.rnfilesystem.RNFileSystemPackage;
import io.realm.react.RealmReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.bugsnag.BugsnagReactNative;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNFSPackage(),
            new RNFileProviderPackage(),
            new RNFileSystemPackage(),
          new RealmReactPackage(),
          new VectorIconsPackage(),
          new ReactNativeLocalizationPackage(),
          BugsnagReactNative.getPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
