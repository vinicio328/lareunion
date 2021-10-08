import { Component } from '@angular/core';
import { SMS } from '@ionic-native/sms/ngx';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public numberMotor1:string = '44264106';
  public numberMotor2:string = '48135997';
  public smsTextmessage: string = '';
  public appHashString: string = '';
  public isOn1:boolean = false;
  public isOn2:boolean = false;
  public level1: number = 0;
  public level2: number = 0;
  public motor: string;
  public comando: string;
  public respuesta: string;
  constructor(private sms: SMS, private smsRetriever: SmsRetriever, public alertController: AlertController,
     public loadingController: LoadingController) {
    this.getHashCode();
    this.presentLoading();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Obteniendo estado...',
      duration: 10000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

  async presentAlertConfirm(value : number = 0) {
    var nivel = (value == 0) ? "Vacia" : "Llena";
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Motor ' + this.motor+ ': nivel de agua',
      message: 'La sisterna esta ¡<strong>'+nivel+'</strong>!',
      buttons: [{
          text: 'Ok'
        }
      ]
    });

    await alert.present();
  }

  verifyStatus(isFirstMotor: boolean = true) 
  {
    var nubmer = (isFirstMotor) ? this.numberMotor1 : this.numberMotor2;
    this.sms.send(nubmer, `status`);
  }

  consultarNivel(isFirstMotor: boolean = true) 
  {
    var nubmer = (isFirstMotor) ? this.numberMotor1 : this.numberMotor2;
    this.sms.send(nubmer, `level`);
  }

  encenderMotor(isFirstMotor: boolean = true) {
    var nubmer = (isFirstMotor) ? this.numberMotor1 : this.numberMotor2;
    this.sms.send(nubmer, `on`);
    if (isFirstMotor)
    {
      this.isOn1 = true;
    }
    else
    {
      this.isOn2 = true;  
    }
    
  }

  apagarMotor(isFirstMotor: boolean = true) {
    var nubmer = (isFirstMotor) ? this.numberMotor1 : this.numberMotor2;
    this.sms.send(nubmer, `off`);
    if (isFirstMotor)
    {
      this.isOn1 = false;
    }
    else
    {
      this.isOn2 = false;  
    }
  }

  getHashCode() {
    this.smsRetriever.getAppHash()
      .then((res: any) => {
        this.appHashString = res;        
        this.verifyStatus();
        this.verifyStatus(false);
        this.consultarNivel();
        this.consultarNivel(false);
        this.getSMS();
      })
      .catch((error: any) => console.error(error));
  }

  getSMS() {
    this.smsRetriever.startWatching()
      .then((res: any) => {        
        this.smsTextmessage = res.Message;        
        var texto = this.smsTextmessage.split(" ");
        var comandoSplit = texto[0].split(":");
        console.log(comandoSplit);
        this.comando = comandoSplit[0];
        this.motor = comandoSplit[1];
        this.respuesta = comandoSplit[2];
        console.log(this.respuesta);
        switch (comandoSplit[0]) 
        {
          case "status":
            if (this.motor == "1")
            {
              this.isOn1 = (this.respuesta.trim().toLowerCase() == "on");
            }
            else 
            {
              this.isOn2 = (this.respuesta.trim().toLowerCase() == "on");
            }
            
          break;
          case "level":
            if (this.motor == "1")
            {
              this.level1 = Number(this.respuesta);
            }
            else 
            {
              this.level2 = Number(this.respuesta);
            }
          break;
          case "alert":
            if (this.motor == "1")
            {
              this.level1 = Number(this.respuesta);
            }
            else 
            {
              this.level2 = Number(this.respuesta);
            }
            this.presentAlertConfirm(Number(this.respuesta));
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
// comando:1:resputa #key#
// level:1:0 #key#
// status:1:on #key#
// comando:respuesta #key#
// alert:1:0-1 #key#
// comando:{json} #key#