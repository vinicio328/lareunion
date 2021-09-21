import { Component } from '@angular/core';
import { SMS } from '@ionic-native/sms/ngx';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public smsTextmessage: string = '';
  public appHashString: string = '';
  public isOn:boolean = false;
  constructor(private sms: SMS, private smsRetriever: SmsRetriever) {
    this.getHashCode();        
  }

  verifyStatus() 
  {
    this.sms.send('48135997', `status  #${this.appHashString}#`);
  }

  encenderMotor() {
    this.sms.send('48135997', `on #${this.appHashString}#`);
    this.isOn = true;
  }


  apagarMotor() {
    this.sms.send('48135997', `off #${this.appHashString}#`);
    this.isOn = false;
  }


  getHashCode() {
    this.smsRetriever.getAppHash()
      .then((res: any) => {
        this.appHashString = res;        
        this.verifyStatus();
        this.getSMS();
      })
      .catch((error: any) => console.error(error));
  }

  getSMS() {
    this.smsRetriever.startWatching()
      .then((res: any) => {
        this.smsTextmessage = res.Message;
        
        var texto = this.smsTextmessage.split(" ");
        var comando = texto[0].split(":");
        console.log(comando);
        var respuesta = comando[1];
        console.log(respuesta);
        switch (comando[0]) 
        {
          case "status":
            this.isOn = (respuesta.trim() == "on");
          break;
        }

      })
      .catch((error: any) => console.error(error))
      .finally(() => {
        this.getSMS();
      });
  }
}

// comando  #key#

// comando:respuesta #key#

// comando:{json} #key#