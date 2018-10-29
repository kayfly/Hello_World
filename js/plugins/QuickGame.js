//=============================================================================
// QuickGame
// KayFly
//=============================================================================

/*:
 * @plugindesc Allows you skip the title, and so you can quick start the game!
 * @author KayFly
 *
 * @param Skip
 * @desc Skip the title? (Y/N)
 * @default Y
 * 
 * @help My first plugin! Although it so simple!
 *
 */

(function() {

  var parameters = PluginManager.parameters('QuickGame');
  var healHP = (parameters['Skip'].toUpperCase() || '') === 'Y';

  var KayFly_Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function() {
    if (healHP || this.actor().meta.LUHealHP) 
      {Scene_Base.prototype.start.call(this);
      SoundManager.preloadImportantSounds();
      this.checkPlayerLocation();
      DataManager.setupNewGame();
      SceneManager.goto(Scene_Map);
      this.updateDocumentTitle();
    }
   
  };


})();