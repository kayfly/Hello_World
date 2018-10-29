/*:
 * @plugindesc USG_Matter.js デバック用プラグイン. 
 * @author ふしぎうさぎ
 *
 * 
 * @help
 * 
 * USG_Matter.js（matter.js導入用プラグイン）のデバック用です。
 * MITライセンスでの配布です　(The MIT License)
 * 
 * matter.js、USG_Matter.jsを先にプラグイン登録してください。
 * プラグインコマンド、パラメータは無いです。
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

"use strict";

const _setupWorld = Game_Map.prototype.setupWorld;
Game_Map.prototype.setupWorld = function () {
    _setupWorld.call(this);
    this.createRender();
};

/**
 * 剛体レンダーを設定.
 * @method createRender
 */
Game_Map.prototype.createRender = function () {
    this._needRender = true;
    const w = $gameMap.width() * $gameMap.tileWidth();
    const h = $gameMap.height() * $gameMap.tileHeight();
    PhysicsManager._world.setRender(w, h);
};

},{}],2:[function(require,module,exports){


require("./_game/map.js");
require("./_physics/world.js");
require("./_spriteset/map.js");

(function () {})();

},{"./_game/map.js":1,"./_physics/world.js":3,"./_spriteset/map.js":4}],3:[function(require,module,exports){
"use strict";

Physics_World.prototype.setRender = function (w, h) {
    this._render = Matter.Render.create({
        // element: this._renderDom,
        engine: this._engine,
        options: {
            width: w,
            height: h,
            hasBounds: true,
            // showAngleIndicator: true,
            showAxes: true,
            showCollisions: true,
            // showSleeping: true,
            // showConvexHulls: true,
            showVelocity: true
            // wireframes : false
        }
    });
    Matter.Render.run(this._render);
};

},{}],4:[function(require,module,exports){


"use strict";
// var _createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
// Spriteset_Map.prototype.createLowerLayer = function () {
//     _createLowerLayer.call(this);

//     this.createPhysicsRender();
// };

/**
 * デバッグ用、剛体レンダー.
 * @method createPhysicsRender
 */

Spriteset_Map.prototype.createPhysicsRender = function () {
    // var texture = PIXI.Texture.fromCanvas($gameMap._render.canvas);
    // var sprite =
    var render = this._debugRender();
    if (!render) {
        return;
    }
    if (this._physicsRender) {
        this._baseSprite.removeChild(this._physicsRender);
    }
    var bitmap = new Bitmap();
    bitmap.__canvas = render.canvas;
    bitmap.__context = bitmap._canvas.getContext('2d');
    bitmap.__baseTexture = new PIXI.BaseTexture(bitmap._canvas);
    bitmap._baseTexture.mipmap = false;
    bitmap._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    this._physicsRender = new Sprite(bitmap);
    this._physicsRender._mapId = $gameMap.mapId();
    this._baseSprite.addChild(this._physicsRender);
};

Spriteset_Map.prototype._debugRender = function () {
    return PhysicsManager._world ? PhysicsManager._world._render : null;
};

/**
 * 更新処理.
 * @method update
 */
var _update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function () {
    if (!this._physicsRender || $gameMap._needRender) {
        this.createPhysicsRender();
        $gameMap._needRender = false;
    }
    _update.call(this);
    if (!this._physicsRender) {
        return;
    }
    this._physicsRender.bitmap._baseTexture.update();
    this._physicsRender.x = -$gameMap.tileWidth() * $gameMap._displayX;
    this._physicsRender.y = -$gameMap.tileHeight() * $gameMap._displayY;

    this.drawPlayerFront();
};

Spriteset_Map.prototype.drawPlayerFront = function () {

    $gameMap.allCharactersHasBody().forEach(function (character) {
        const point = character.frontPoint();
        const x = point.x * $gameMap.tileWidth();
        const y = point.y * $gameMap.tileHeight();
        this._physicsRender.bitmap.drawCircle(x, y, 5, "rgb(255, 0, 0)");
    }, this);
};

},{}]},{},[2]);
