//===========================================================
// 作者: tomoaky (http://hikimoki.sakura.ne.jp/)
// 版本: 1.0.0
// 最近更新: 2018/06/02
// 官方网址: http://hikimoki.sakura.ne.jp/
// -----------------------------------------------------------
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ===========================================================

/*:
 * @plugindesc Matter.js帮助指南
 * @author ふしぎうさぎ (作者: tomoaky)
 * 
 * @param gravityX
 * @type number
 * @min -100
 * @decimals 2
 * @desc 横向重力
 * 初期値: 0
 * @default 0
 *
 * @param gravityY
 * @type number
 * @min -100
 * @decimals 2
 * @desc 纵向重力
 * 初期値: 0.9
 * @default 0.9
 *
 * @param maxSpeed
 * @type number
 * @decimals 2
 * @desc 最高速度的校正倍率 
 * 初期値: 5.0
 * @default 5.0
 * 
 * @param controlType
 * @type select
 * @option KEYBOARD
 * @option FLICK
 * @option FREE
 * @desc 操作模式（键盘，轻击或者自由）
 * @default KEYBOARD
 * 
 * @param eventControl
 * @type boolean
 * @desc 不仅仅是玩家，事件也可以操作 
 * @default false
 * 
 * @param flickCommonEvent
 * @type common_event
 * @desc フリック操作時に実行するコモンイベント
 * @default 0
 * 
 * @param scrollInputBorder
 * @type number
 * @desc 接收滚动输入的范围（从画面端的点数）
 *  *滚动是操作类型仅在FREE时有效的。 
 * @default 64
 * 
 * @param scrollSpeed
 * @type number
 * @decimals 2
 * @desc 滚动速度
 * @default 0.25
 * 
 * @param movePower
 * @type number
 * @decimals 2
 * @desc 操作类型是 KEYBOARD 时的移动力。
 * @default 0.5
 * 
 * @param moveLimit
 * @type number
 * @decimals 2
 * @desc 移动限制
 * @default 0.2
 * 
 * @param jumpPower
 * @type number
 * @decimals 2
 * @desc 操作类型是 KEYBOARD 时的跳跃力。
 * @default 0.2
 * 
 * @param useWallRender
 * @type boolean
 * @desc 渲染用瓷砖的通行判定的刚体（刚体力学）。 
 * @default true
 * 
 * @param showPlayerFront
 * @type boolean
 * @desc 显示列表光标/显示抓取光标，玩家前面的小红点
 * @default false
 * 
 * @param showWireFrame
 * @type boolean
 * @desc 用线框显示。
 * @default false
 * 
 * @param seFlick
 * @type struct<SoundEffect>
 * @desc 跳跃动作的音效
 * @default {"name":"Jump1","volume":"90","pitch":"100","pan":"0"}
 * 
 * @param matterType1
 * @type struct<MatterParams>
 * @desc <mat:1> 标签设置
 * @default {"name":"<mat:1>","density":"0.1","friction":"0.1","frictionAir":"0.1","restitution":"0.1"}
 * 
 * @param matterType2
 * @type struct<MatterParams>
 * @desc <mat:2> 标签设置
 * @default {"name":"<mat:2>","density":"0.1","friction":"0.1","frictionAir":"0.1","restitution":"0.1"}
 * 
 * @param matterType3
 * @type struct<MatterParams>
 * @desc <mat:3> 标签设置
 * @default {"name":"<mat:3>","density":"0.1","friction":"0.1","frictionAir":"0.1","restitution":"0.1"}
 * 
 * @param matterType4
 * @type struct<MatterParams>
 * @desc <mat:4> 标签设置
 * @default {"name":"<mat:4>","density":"0.1","friction":"0.1","frictionAir":"0.1","restitution":"0.1"}
 * 
 * @param matterType5
 * @type struct<MatterParams>
 * @desc <mat:5> 标签设置
 * @default {"name":"<mat:5>","density":"0.1","friction":"0.1","frictionAir":"0.1","restitution":"0.1"}
 * 
 * @requiredAssets img/system/SwipeArrow
 * 
 * 
 * @help
 * USG_Matter_TM.js ver1.0.0
 * 
 * このプラグインは ふしぎうさぎ様 の Matter.js使用プラグイン を
 * tomoaky未经许可进行了更改，并重新分发。
 * ( 改変元: https://tm.lucky-duet.com/viewtopic.php?t=4387 )
 * 问题报告和追加要求等请务必请联系tomoaky。
 * 
 * 本插件基于MV Version 1.5.1 版本。
 * 
 * このプラグインはMITライセンスのもとに配布しています、商用利用、
 * 改造、再配布など、自由にお使いいただけます。
 * 
 *在创建新地图时，首先使用通道图块绘制整个地图。
 *在初始状态下，整个地图都不可通过。
 * 
 * note栏标签一览（动作/事件）：
 *   <body:rectangle> 四角形剛体
 *   <body:circle> 円形剛体
 *   <body:polygon> 多角形剛体
 *   <w:1> 四角形剛体の横幅 ( 省略時 1 )
 *   <h:1> 四角形剛体の縦幅 ( 省略時 1 )
 *   <r:0.5> 円形剛体の半径 / 多角形剛体の大きさ ( 省略時 0.5 )
 *   <sides:3> 多角形剛体の辺の数 ( 省略時 3 )
 *   <chamfer:0.1> 面取り ( 値の数は 1 or 頂点数 )
 *   <density:0.1> 密度(質量)
 *   <friction:0.1> 摩擦係数
 *   <frictionAir:0.1> 空気抵抗
 *   <restitution:0.1> 反発係数 ( 0 ~ 1 )
 *   <mat:1> 下記の 4 種類のパラメータをまとめて設定
 *     density / friction / frictionAir / restitution
 *     値はプラグインパラメータ matterType1 ~ 5 に設定
 *   <angle:180> 角度 ( 0 ~ 180 )
 *   <noRotate> 回転を禁止
 *   <constraint:ax ay eventId bx by> ピン留め
 *   　ax 自分のピン留めX座標
 *     ay 自分のピン留めY座標
 *     eventId ピン留め対象(省略可)
 *     bx 対象のピン留めX座標(省略可)
 *     by 対象のピン留めY座標(省略可)
 *   <length:2> ピン留め位置からの距離
 *   <stiffness:0.7> ピン留めの剛性
 *   <damping:0> ピン留めの減衰? ( 値が大きいとフリーズ )
 *   <category:2> 接触判定カテゴリ
 *   <mask:1> 接触判定マスク
 *   <noRender> matter.js不在旁边渲染
 *   <static> 初期位置に固定
 * 
 * 脚本命令列表（设置移动路线）： 
 *   this.rotate(0.04) 回転
 * 
 * 
 * ===========================================================
 * 以下是原创的帮助。
 * ===========================================================
 * 
 * matter.js（物理エンジン）(バージョン0.13.0)導入用プラグインです。
 * MITライセンスでの配布です　(The MIT License)
 * 
 * matter.jsを先にプラグイン登録してください。
 * プラグインコマンド、パラメータは無いです。
 * 
 * 
 * 剛体の設定は、イベント・アクターのメモ欄を使用します。
 * ・body {String}　剛体の形状（circle or rectangle）未設定の場合、剛体なし
 * ・r {Numner} 円形剛体の半径
 * ・w {Number} 四角剛体の横幅
 * ・h {Number} 四角剛体の縦幅
 * ・density　{Number}　密度(質量)　デフォ値0.1
 * ・friction　{Number}　摩擦係数　デフォ値0.1
 * ・frictionAir {Number}　空気抵抗 デフォ値0.1
 * ・restitution {Number}　反発係数　デフォ値0.1 　範囲(0~1)
 * ・static {パラメータなし} 記入時、剛体を固定
 * 
 * 例）<body:circle><r:0.5><density:0.1><static>
 */
/*~struct~SoundEffect:
 *
 * @param name
 * @type file
 * @dir audio/se/
 * @desc 効果音のファイル名
 * @default 
 * @require 1
 *
 * @param volume
 * @type number
 * @max 100
 * @desc 効果音の音量
 * 初期値: 90
 * @default 90
 *
 * @param pitch
 * @type number
 * @min 50
 * @max 150
 * @desc 効果音のピッチ
 * 初期値: 100
 * @default 100
 *
 * @param pan
 * @type number
 * @min -100
 * @max 100
 * @desc 効果音の位相
 * 初期値: 0
 * @default 0
 *
 */
/*~struct~MatterParams:
 *
 * @param name
 * @desc 特に意味のないパラメータです、メモ代わりに使います。
 * @default 
 * 
 * @param density
 * @type number
 * @decimals 2
 * @desc 密度(質量)
 * @default 0.1
 *
 * @param friction
 * @type number
 * @decimals 2
 * @desc 摩擦係数
 * @default 0.1
 *
 * @param frictionAir
 * @type number
 * @decimals 2
 * @desc 空気抵抗
 * @default 0.1
 *
 * @param restitution
 * @type number
 * @decimals 2
 * @desc 反発係数 ( 0 ~ 1 )
 * @default 0.1
 *
 */

const TMParameters = PluginManager.parameters('USG_Matter_TM');
const TMGravityX = +(TMParameters['gravityX'] || 0);
const TMGravityY = +(TMParameters['gravityY'] || 0.9);
const TMMaxSpeed = +(TMParameters['maxSpeed'] || 5);
const TMScrollInputBorder = +(TMParameters['scrollInputBorder'] || 64);
const TMScrollSpeed = +(TMParameters['scrollSpeed'] || 0.25);
const TMControlType = TMParameters['controlType'] || 'FLICK';
const TMEventControl = JSON.parse(TMParameters['eventControl']);
const TMFlickCommonEvent = +(TMParameters['flickCommonEvent'] || 0);
const TMMovePower = +(TMParameters['movePower'] || 0.5);
const TMMoveLimit = +(TMParameters['moveLimit'] || 0.2);
const TMJumpPower = +(TMParameters['jumpPower'] || 0.2);
const TMUseWallRender = JSON.parse(TMParameters['useWallRender'] || 'false');
const TMShowPlayerFront = JSON.parse(TMParameters['showPlayerFront'] || 'false');
const TMShowWireFrame = JSON.parse(TMParameters['showWireFrame'] || 'false');
const TMSeFlick = JSON.parse(TMParameters['seFlick'] || '{}');

var TMMatterParams = [];
for (var i = 1; i <= 5; i++) {
  TMMatterParams[i] = JSON.parse(TMParameters['matterType' + i] || '{}');
}

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Game_Temp
//

Game_Temp.prototype.isDestinationValid = function() {
  return false;
};

//-----------------------------------------------------------------------------
// Game_Character
//

const _initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function () {
    _initMembers.call(this);
    this._bodyIndex = -1;
    this._bodyCenter = {
        x: 0.5,
        y: 0
    };
    this._frontAngle = 0;
    this._walkCount = 0;
    this._walkDirection = 0;
    this._triggerWaitCount = 0;
    this._matterJumpCount = 1;
    this._lastMatterVy = null;
};

Object.defineProperties(Game_Character.prototype, {
    body: {
        get: function () {
            if (this._bodyIndex >= 0) {
                return PhysicsManager.body(this._bodyIndex);
            }
            return null;
        },
        configurable: true
    }
});

Game_Character.prototype.isRenderVisible = function() {
    return false;
};

const _locate = Game_Character.prototype.locate;
Game_Character.prototype.locate = function (x, y) {
    _locate.call(this, x, y);
    if (!!this.body) {
        let cx = x + this._bodyCenter.x;
        let cy = y + this._bodyCenter.y;
        this.body.move(cx, cy);
    } else {
        this._realX = x;
        this._realY = y;
    }
};

const _update = Game_Character.prototype.update;
Game_Character.prototype.update = function () {
    if (this.body) {
        this._realX = this.body.x - this._bodyCenter.x;
        this._realY = this.body.y - this._bodyCenter.y;
        this._x = Math.floor(this._realX);
        this._y = Math.floor(this._realY);
        this._angle = this.body._body.angle;
    }
    _update.call(this);
    if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
        return;
    }
    if (this.isTriggerWait()) {
        this._triggerWaitCount--;
        return;
    }
    this.updateWalk();
    // this.updateDirection();

    this.updateCollide();
};

/**
 * walkCountがある間、進行方向に移動.
 * @method updateWalk
 */
Game_Character.prototype.updateWalk = function () {
    if (!this.body) {
        return;
    }
    if (this.isMoving()) {
        this.moveStraight(this.walkDirection());
        this._walkCount--;
    } else {
        this._walkCount = 0;
        this._walkDirection = 0;
    }
};

/**
 * 移動量に応じて、向いている方向を更新.
 * @method updateDirection
 */
Game_Character.prototype.updateDirection = function () {
    if (!this.body) {
        return;
    }
    // this.setFront(this.body.vx, this.body.vy);
};
/**
 * 接触処理.
 * @method updateCollide
 */
Game_Character.prototype.updateCollide = function () {
    if (!this.body) {
        return;
    }
    this.body._collide = [];
};

/**
 * 移動進行方向を返す.
 * @method walkDirection
 * @return {Number}
 */
Game_Character.prototype.walkDirection = function () {
    return this._walkDirection;
};

Game_Character.prototype.lookAt = function (target) {
    const bodyA = this.body;
    const bodyB = !!target ? target.body : null;
    if (!!bodyA && !!bodyB) {}
    return false;
};

const _isMoving = Game_Character.prototype.isMoving;
Game_Character.prototype.isMoving = function () {
    if (this.body) {
        return this._walkCount > 0;
    } else {
        _isMoving.call(this);
    }
};

Game_Character.prototype.isStatic = function () {
  if (!this.body) return false;
  return this.body._body.isStatic;
};

/**
 * 左を基点に、時計回りにキャラの向いている方向を設定.
 * @method setFront
 * @param x {Number} Xベクトル
 * @param y {number} yベクトル
 */
Game_Character.prototype.setFront = function (x, y) {
    if (x == 0 && y == 0) {
        return;
    }
    var angle = Math.acos(x / Math.sqrt(x * x + y * y));
    if (y <= 0) {
        angle *= -1;
    }
    angle += Math.PI;
    this._frontAngle = angle;
    if (!this.isDirectionFixed()) {
        if (Math.PI * 5 / 4 <= angle && angle <= Math.PI * 7 / 4) {
            this._direction = 2;
        } else if (angle < Math.PI / 4 || Math.PI * 7 / 4 < angle) {
            this._direction = 4;
        } else if (Math.PI * 3 / 4 < angle && angle < Math.PI * 5 / 4) {
            this._direction = 6;
        } else if (Math.PI / 4 <= angle && angle <= Math.PI * 3 / 4) {
            this._direction = 8;
        } else {
            this._direction = 0;
        }
    }
};

Game_Character.prototype.frontVector = function () {
    var dir = this._frontAngle + Math.PI;
    var x = Math.cos(dir);
    var y = Math.sin(dir);
    return {
        x: x,
        y: y
    };
};

/*Game_Character.prototype.direction = function () {
    if (!this.body) {
        return this._direction;
    }
    const angle = this._frontAngle;
    if (Math.PI * 5 / 4 <= angle && angle <= Math.PI * 7 / 4) {
        return 2;
    } else if (angle < Math.PI / 4 || Math.PI * 7 / 4 < angle) {
        return 4;
    } else if (Math.PI * 3 / 4 < angle && angle < Math.PI * 5 / 4) {
        return 6;
    } else if (Math.PI / 4 <= angle && angle <= Math.PI * 3 / 4) {
        return 8;
    }
    return 0;
};*/

const _setDirection = Game_Character.prototype.setDirection;
Game_Character.prototype.setDirection = function (d) {
    if (this.body) {
        let x = d === 0 ? 0 : d % 3 === 0 ? 1 : d % 3 === 1 ? -1 : 0;
        let y = d === 0 ? 0 : d <= 3 ? 1 : d >= 7 ? -1 : 0;
        this.setFront(x, y);
        this.resetStopCount();
    } else {
        _setDirection.call(this, d);
    }
};

Game_Character.prototype.addSpeed = function () {
    return 0.05 + Math.pow(2, this.realMoveSpeed()) / 64;
};

Game_Character.prototype.maxSpeed = function () {
    return (this.realMoveSpeed() + 2) * TMMaxSpeed;
};

Game_Character.prototype.walkWaitCount = function () {
    return 20;
};

Game_Character.prototype.isMoving = function () {
    if (this.body) {
        return this._walkCount > 0;
    } else {
        return Game_CharacterBase.prototype.isMoving.call(this);
    }
};

const _moveStraight = Game_Character.prototype.moveStraight;
Game_Character.prototype.moveStraight = function (d) {
    if (d == 0) {
        return;
    }
    if (this.body) {
        this._walkDirection = d;
        let vx = this.addSpeed() * (d === 0 ? 0 : d % 3 === 0 ? 1 : d % 3 === 1 ? -1 : 0);
        let vy = this.addSpeed() * (d === 0 ? 0 : d <= 3 ? 1 : d >= 7 ? -1 : 0);
        if (vx != 0 && vy != 0) {
            vx /= 1.42;
            vy /= 1.42;
        }
        // if (vx != 0 || vy != 0) {
        //     this.requestMotion("walk");
        // } else {
        //     this.requestMotion("wait");
        // }
        this.body.addVelocity(vx, vy);
        this.setFront(vx, vy);
        this.resetStopCount();

        //歩きはじめ時
        if (this._walkCount == 0) {
            this._walkCount = this.walkWaitCount();
            //接触イベント発火
            if (!this.isTriggerWait()) {
                this.checkEventTriggerTouchFront(d);
                if ($gameMap.setupStartingEvent()) {
                    this._triggerWaitCount = 20;
                }
            }
        }
    } else {
        _moveStraight.call(this, d);
    }
};

const _moveRandom = Game_Character.prototype.moveRandom;
Game_Character.prototype.moveRandom = function () {
    if (this.body) {
        const d = 2 + Math.randomInt(4) * 2;;
        this.moveStraight(d);
    } else {
        _moveRandom.call(this);
    }
};

Game_Character.prototype.frontPoint = function () {
    let point = {
        x: this._realX,
        y: this._realY
    };
    if (this.body) {
        point.x = this.body.x;
        point.y = this.body.y;
        point.x -= Math.cos(this._frontAngle) * 0.7;
        point.y -= Math.sin(this._frontAngle) * 0.7;
    }
    return point;
};

Game_Character.prototype.frontCharacters = function () {
    const point = this.frontPoint();
    const characters = $gameMap.pointCharacters(point);
    let newList = [];
    characters.forEach(function (character) {
        if (character != this) {
            newList.push(character);
        }
    }, this);
    return characters;
};

Game_Character.prototype.createBody = function () {
    const data = this.bodyData();
    if (!data) {
        return;
    }
    this._bodyCenter.y = 0.5;
    const body = new Physics_Body(data);
    body._body.render.visible = this.isRenderVisible();
    PhysicsManager.addBody(body);
    this.locate(this._realX, this._realY);
    const meta = this.metaData();
    if (meta.angle) {
        this.body.setAngle(parseFloat(meta.angle) / 180 * Math.PI);
    }
};

Game_Character.prototype.createConstraint = function() {
    const meta = this.metaData();
    if (meta.constraint) {
        var a = meta.constraint.split(' ').map(parseFloat);
        var pos = this.body._body.position;
        if (a[2]) {
          var constraint = Matter.Constraint.create({
              bodyA: this.body._body,
              pointA: { x: a[0] * $gameMap.tileWidth(), y: a[1] * $gameMap.tileHeight() },
              bodyB: $gameMap.event(a[2]).body._body,
              pointB: { x: a[3] != null ? a[3] * $gameMap.tileWidth() : 0,
                        y: a[4] != null ? a[4] * $gameMap.tileHeight() : 0 },
              length: meta.length ? parseFloat(meta.length) * $gameMap.tileWidth() : 0,
              stiffness: meta.stiffness ? parseFloat(meta.stiffness) : 0.7,
              damping: meta.damping ? parseFloat(meta.damping) : 0
          });
        } else {
          var constraint = Matter.Constraint.create({
              bodyA: this.body._body,
              pointA: { x: a[0] * $gameMap.tileWidth(), y: a[1] * $gameMap.tileHeight() },
              pointB: { x: pos.x, y: pos.y },
              length: meta.length ? parseFloat(meta.length) * $gameMap.tileWidth() : 0,
              stiffness: meta.stiffness ? parseFloat(meta.stiffness) : 0.7,
              damping: meta.damping ? parseFloat(meta.damping) : 0
          });
        }
        Matter.World.add(PhysicsManager._world.world, constraint);
    }
};

Game_Character.prototype.addConstraint = function(constraint) {
  Matter.World.add(PhysicsManager._world.world, constraint);
};

Game_Character.prototype.bodyData = function () {
    const meta = this.metaData();
    if (!meta.body) {
        return null;
    }
    const type = meta.body == true ? "rectangle" : meta.body;
    let coor = {};
    if (type == "rectangle") {
        coor.w = meta.w ? parseFloat(meta.w) : 1;
        coor.h = meta.h ? parseFloat(meta.h) : 1;
    } else if (type == "circle") {
        coor.r = meta.r ? parseFloat(meta.r) : 0.5;
    } else if (type == "polygon") {
        coor.sides = meta.sides ? meta.sides : 3;
        coor.radius = (meta.r ? parseFloat(meta.r) : 0.5) * $gameMap.tileWidth();
    }
    let data = {
        character: this,
        type: type,
        coordinate: coor,
        option: {
            isStatic: false
        }
    };
    //オプション
    if (meta.mat) {
      var matterParams = TMMatterParams[+meta.mat];
      data.option.density = parseFloat(matterParams.density);
      data.option.friction = parseFloat(matterParams.friction);
      data.option.frictionAir = parseFloat(matterParams.frictionAir);
      data.option.restitution = parseFloat(matterParams.restitution);
    }
    if (meta.chamfer) {
        var a = meta.chamfer.split(' ').map(function(r) {
          return parseFloat(r) * $gameMap.tileWidth();
        });
        data.option.chamfer = { radius: a };
    }
    if (meta.static) {
        data.option.isStatic = true;
    }
    if (meta.density) {
        data.option.density = parseFloat(meta.density);
    }
    if (meta.friction) {
        data.option.friction = parseFloat(meta.friction);
    }
    if (meta.frictionAir) {
        data.option.frictionAir = parseFloat(meta.frictionAir);
    }
    if (meta.restitution) {
        data.option.restitution = parseFloat(meta.restitution);
    }
    if (!meta.noRotate) {
        data.option.inertia = 0;
    }
    data.option.collisionFilter = {};
    if (meta.category) {
        data.option.collisionFilter.category = parseInt(meta.category);
    }
    if (meta.mask) {
        data.option.collisionFilter.mask = parseInt(meta.mask);
    }

    return data;
};

Game_Character.prototype.metaData = function () {
    return {};
};

/**
 * イベントトリガーの発火待機中かどうか.
 * @method isTriggerWait
 * @return {boolean}
 */
Game_Character.prototype.isTriggerWait = function () {
    if (this._triggerWaitCount > 0) {
        return true;
    }
    return false;
};

// /**
//  * 
//  * @method checkEventTriggerTouchFront
//  */
// Game_Character.prototype.checkEventTriggerTouchFront = function (d) {
//     if (this.body) {
//         const point = this.frontPoint();
//         this.checkEventTriggerTouchBody(point);
//     } else {
//         Game_CharacterBase.prototype.checkEventTriggerTouchFront.call(this, d);
//     }
// };

// Game_Character.prototype.checkEventTriggerTouchBody = function(point){
//     return;
// };

Game_Character.prototype.screenAngle = function() {
  return this._angle;
};

Game_Character.prototype.addVelocityToPosition = function(realX, realY, commonEventId, se) {
  var x = realX - (this._realX + 0.5);
  var y = realY - (this._realY + 0.5);
  var rad = Math.atan2(y, x);
  var distance = (x * x + y * y);
  var vx = Math.cos(rad) * distance;
  var vy = Math.sin(rad) * distance;
  this.body.addVelocity(vx, vy);
  this.setFront(vx, vy);
  this.resetStopCount();
  if (commonEventId) $gameTemp.reserveCommonEvent(commonEventId);
  if (se) AudioManager.playSe(se);
};

Game_Character.prototype.moveFlick = function() {
  var x = $gameMap.canvasToMatterMapX(TouchInput.x);
  var y = $gameMap.canvasToMatterMapY(TouchInput.y);
  this.addVelocityToPosition(x, y, TMFlickCommonEvent, TMSeFlick);
};

Game_Character.prototype.moveFree = function() {
  var x = $gameMap.canvasToMatterMapX(TouchInput.x);
  var y = $gameMap.canvasToMatterMapY(TouchInput.y);
  this.addVelocityToPosition(x, y, 0, null);
};

Game_Character.prototype.rotate = function(angle) {
  if (this.body) {
    this.body.setAngularVelocity(angle);
  }
};

Game_Character.prototype.jump = function(xPlus, yPlus) {
  this.body.setVelocity(xPlus / 10, yPlus / 10);
  this.resetStopCount();
  this.straighten();
};

},{}],2:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Game_Event
//

// Game_Event.prototype.updateSelfMovement = function() {
//     if (!this._locked && !this.isMoving() && this.isNearTheScreen() &&
//             this.checkStop(this.stopCountThreshold())) {
//         console.log(this._walkCount);
//         switch (this._moveType) {
//         case 1:
//             this.moveTypeRandom();
//             break;
//         case 2:
//             this.moveTypeTowardPlayer();
//             break;
//         case 3:
//             this.moveTypeCustom();
//             break;
//         }
//     }
// };

Game_Event.prototype.isRenderVisible = function() {
    const event = $dataMap.events[this._eventId];
    if (event && event.meta.noRender) {
        return false;
    }
    return this._characterName === '';
};

Game_Event.prototype.metaData = function () {
    const event = $dataMap.events[this._eventId];
    if (event) {
        return event.meta;
    }
    return {};
};

Game_Event.prototype.triggerWait = function () {
    if (this._triggerWaitCount > 0 || $gamePlayer.triggerWait()) {
        return true;
    }
    return false;
};

// Game_Event.prototype.checkEventTriggerTouchBody = function (point) {
//     if (!this.body) {
//         return;
//     }
//     if (!$gameMap.isEventRunning() && this._trigger === 2) {
//         if (!this.isJumping() && this.isNormalPriority()) {
//             if (PhysicsManager.queryPoint([$gamePlayer], point).length > 0) {
//                 this.start();
//             }
//         }
//     }
// };

},{}],3:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Game_Map
//

const _setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId) {
    _setup.call(this, mapId);
    this._isContinue = false;
    // this._characters = [];
    this.setupWorld();
};

Game_Map.prototype.setupWorld = function () {
    this.createWorld();
    this.setupBodies();
    this.setupConstraint();

// ここに constraint のセットアップ処理を追加する
// setupBodiesと同じようにイベントをforEachでまわしてタグを参照する。

/*const constraint = Matter.Constraint.create({
  bodyA: $gameMap.event(4).body._body,
  pointA: { x: -0.3 * this.tileWidth(), y: 0 },
  bodyB: $gameMap.event(3).body._body,
  pointB: { x: 0.3 * this.tileWidth(), y: 0 },
  length: 1 * this.tileWidth()
});
console.log(constraint);
$gameMap.event(4).addConstraint(constraint);*/

    this.createRender();

};

Game_Map.prototype.createWorld = function () {
    PhysicsManager.init();
    PhysicsManager.createWorld(this.gravityX(), this.gravityY());
};

Game_Map.prototype.gravityX = function () {
    return this._gravityX != null ? this._gravityX : TMGravityX;
};

Game_Map.prototype.gravityY = function () {
    return this._gravityY != null ? this._gravityY : TMGravityY;
};

Game_Map.prototype.setupBodies = function () {
    $gamePlayer.createBody();
    $gameMap._events.forEach(function (event) {
        if (!event) {
            return;
        }
        event.createBody();
    }, this);
};

Game_Map.prototype.setupConstraint = function () {
    $gameMap._events.forEach(function (event) {
        if (!event) {
            return;
        }
        event.createConstraint();
    }, this);
};

Game_Map.prototype.createRender = function () {
    this._needRender = true;
    const w = $gameMap.width() * $gameMap.tileWidth();
    const h = $gameMap.height() * $gameMap.tileHeight();
    PhysicsManager._world.setRender(w, h);
};

const _update = Game_Map.prototype.update;
Game_Map.prototype.update = function (sceneActive) {
    if (this._isContinue) {
        this.setupWorld();
        this._isContinue = false;
    }
    if (sceneActive) {
        PhysicsManager.update();
    }
    _update.call(this, sceneActive);
};

Game_Map.prototype.collisionRects = function () {
    let tiles = [];
    let tops = [];
    let bottoms = [];
    let lefts = [];
    let rights = [];
    for (let y = 0; y < this.height(); y++) {
        for (let x = 0; x < this.width(); x++) {
            if (this.isCollisionTile(x, y)) {
                tiles.push({ x: x, y: y });
                continue;
            }
            if (this.isCollisionSide(x, y, 2)) {
                bottoms.push({ x: x, y: y });
            }
            if (this.isCollisionSide(x, y, 8)) {
                tops.push({ x: x, y: y });
            }
        }
    }

    for (let x = 0; x < this.width(); x++) {
        for (let y = 0; y < this.height(); y++) {
            if (this.isCollisionTile(x, y)) {
                continue;
            }
            if (this.isCollisionSide(x, y, 4)) {
                lefts.push({ x: x, y: y });
            }
            if (this.isCollisionSide(x, y, 6)) {
                rights.push({ x: x, y: y });
            }
        }
    }

    return {
        tiles: this.margeVerticalRects(this.margeHorizontalTiles(tiles)),
        tops: this.margeHorizontalTiles(tops),
        bottoms: this.margeHorizontalTiles(bottoms),
        lefts: this.margeVerticalTiles(lefts),
        rights: this.margeVerticalTiles(rights)
    };
};

Game_Map.prototype.margeHorizontalTiles = function (tiles) {
    let list = [];
    tiles.forEach(function (tile) {
        if (list.length == 0) {
            list.push({
                x: tile.x,
                y: tile.y,
                w: 1,
                h: 1
            });
            return;
        }
        const rect = list[list.length - 1];
        if (rect.y == tile.y && rect.x + rect.w == tile.x) {
            rect.w += 1;
        } else {
            list.push({
                x: tile.x,
                y: tile.y,
                w: 1,
                h: 1
            });
        }
    }, this);
    return list;
};

Game_Map.prototype.margeVerticalTiles = function (tiles) {
    let list = [];
    tiles.forEach(function (tile) {
        if (list.length == 0) {
            list.push({
                x: tile.x,
                y: tile.y,
                w: 1,
                h: 1
            });
            return;
        }
        const rect = list[list.length - 1];
        if (rect.x == tile.x && rect.y + rect.h == tile.y) {
            rect.h += 1;
        } else {
            list.push({
                x: tile.x,
                y: tile.y,
                w: 1,
                h: 1
            });
        }
    }, this);
    return list;
};

Game_Map.prototype.margeVerticalRects = function (rects) {
    let list = [];
    for (var i = 0; i < rects.length; i++) {
        margeRectList(rects[i], list);
    }
    return list;
};

Game_Map.prototype.isCollisionTile = function (x, y) {
    return !(this.isPassable(x, y, 2) || this.isPassable(x, y, 4) || this.isPassable(x, y, 6) || this.isPassable(x, y, 8));
};

Game_Map.prototype.isCollisionSide = function (x, y, side) {
    return !this.isPassable(x, y, side);
};

/**
 * マップ上のキャラクターを取得.
 * @method allCharacters
 * @param egnorePlayer {boolean}
 * @return Array<Game_Character>
 */
Game_Map.prototype.allCharacters = function (egnorePlayer) {
    let characters = [];
    if (!egnorePlayer) {
        characters.push($gamePlayer);
    }
    this._events.forEach(function (event) {
        if (event && !event._erased) {
            characters.push(event);
        }
    }, this);
    return characters;
};

/**
 * マップ上のキャラクター(剛体持ち)を取得.
 * @method allCharactersHasBody
 * @param egnorePlayer {boolean}
 * @return Array<Game_Character>
 */
Game_Map.prototype.allCharactersHasBody = function (egnorePlayer) {
    let characters = [];
    this.allCharacters(egnorePlayer).forEach(function (character) {
        if (character.body) {
            characters.push(character);
        }
    }, this);
    return characters;
};

/**
 * 指定座標に剛体が重なるキャラクターを取得.
 * @method pointCharacters
 * @param point {Vector} 座標
 * @param egnorePlayer {boolean}
 */
Game_Map.prototype.pointCharacters = function (point, egnorePlayer) {
    let list = [];
    this.allCharactersHasBody(egnorePlayer).forEach(function (character) {
        list.push(character.body._body);
    }, this);
    const world = PhysicsManager._world.world;
    let characters = [];
    point.x *= this.tileWidth();
    point.y *= this.tileHeight();
    Matter.Query.point(list, point).forEach(function (body) {
        if (body._character) {
            characters.push(body._character);
        }
    }, this);
    return characters;
};

////
//// ローカル関数
////
function margeRectList(node, list) {
    for (var i = list.length - 1; i >= 0; i--) {
        const rect = list[i];
        if (rect.y + rect.h == node.y) {
            if (node.x <= rect.x && rect.x + rect.w <= node.x + node.w) {
                //rectに接続
                rect.h += 1;

                //はみ出し分
                var tmps = [];
                //左側
                if (node.x < rect.x) {
                    tmps.push({
                        x: node.x,
                        y: node.y,
                        w: rect.x - node.x,
                        h: 1
                    });
                }
                //右側
                if (rect.x + rect.w < node.x + node.w) {
                    tmps.push({
                        x: rect.x + rect.w,
                        y: node.y,
                        w: node.x + node.w - rect.x - rect.w,
                        h: 1
                    });
                }
                for (var j = 0; j < tmps.length; j++) {
                    margeRectList(tmps[j], list);
                }
                return;
            }
        }
    };
    //接続なし
    list.push({
        x: node.x,
        y: node.y,
        w: node.w,
        h: node.h
    });
}

Game_Map.prototype.canvasToMatterMapX = function(x) {
  var tileWidth = this.tileWidth();
  return (this._displayX * tileWidth + x) / tileWidth;
};

Game_Map.prototype.canvasToMatterMapY = function(y) {
  var tileHeight = this.tileHeight();
  return (this._displayY * tileHeight + y) / tileHeight;
};

Game_Map.prototype.isMatterFlick = function() {
  var type = this._matterControlType != null ? this._matterControlType : TMControlType;
  return type === 'FLICK';
};

Game_Map.prototype.isMatterFree = function() {
  var type = this._matterControlType != null ? this._matterControlType : TMControlType;
  return type === 'FREE';
};

Game_Map.prototype.isMatterKeyboard = function() {
  var type = this._matterControlType != null ? this._matterControlType : TMControlType;
  return type === 'KEYBOARD';
};

Game_Map.prototype.isMatterEventControl = function() {
  return this._matterEventControl != null ? this._matterEventControl : TMEventControl;
};

Game_Map.prototype.activeMatterEvent = function() {
  if (this._matterMapId !== this.mapId()) {
    this._activeMatterEventId = null;
  }
  switch (this._activeMatterEventId) {
  case null:
    return null;
  case -1:
    return $gamePlayer;
  default:
    return this.event(this._activeMatterEventId);
  }
};

Game_Map.prototype.setActiveMatterEventId = function(eventId) {
  this._activeMatterEventId = eventId;
  this._matterMapId = this.mapId();
};

Game_Map.prototype.matterTest = function() {
  var a = Matter.Constraint.create({ bodyA: this.event(2).body._body, bodyB: this.event(16).body._body,
    pointA: { x: 0, y: 20 }, pointB: { x: -40, y: 0 }, length: 100, stiffness: 0.2, damping: 1 });
/*  var a = Matter.Constraint.create({ bodyA: this.event(15).body._body, pointB: { x: this.event(15).body._body.position.x,
    y: this.event(15).body._body.position.y }, length: 0 });*/
  Matter.World.add(PhysicsManager._world.world, a);
};

},{}],4:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Game_Player
//

var _Game_Player_isMoving = Game_Player.prototype.isMoving;
Game_Player.prototype.isMoving = function() {
    if (!$gameMap.isMatterKeyboard()) {
      return _Game_Map.isMoving.call(this);
    }
    return Input.isPressed('left') || Input.isPressed('right');
};

var _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    _Game_Player_update.call(this, sceneActive);
    if (sceneActive) {
        this.grabByInput();
    }
};

Game_Player.prototype.moveByInput = function () {
    if (!$gameMap.isMatterKeyboard()) return;
    if (this.body.vy <= 0 && this._lastMatterVy > 0) {
      this._matterJumpCount = 1;
    }
    this._lastMatterVy = this.body.vy;
    if (!this.body || !this.canMove()) {
        return;
    }
    if (Input.isPressed('left')) {
      if (this.body.vx > -TMMoveLimit) this.body.addVelocity(-TMMovePower, 0);
      this.setDirection(4);
    } else if (Input.isPressed('right')) {
      if (this.body.vx < TMMoveLimit) this.body.addVelocity(TMMovePower, 0);
      this.setDirection(6);
    }
    if (Input.isTriggered('up') && this._matterJumpCount > 0) {
      AudioManager.playSe(TMSeFlick);
      this.body.setVelocity(this.body.vx, -TMJumpPower);
      this._lastMatterVy = this.body.vy;
      this._matterJumpCount--;
    }
};

Game_Player.prototype.grabByInput = function() {
  if (this._grabConstraint) {
    if (!Input.isPressed('shift')) {
      Matter.World.remove(PhysicsManager._world.world, this._grabConstraint);
      this._grabConstraint = null;
    }
  } else {
    if (Input.isTriggered('shift')) {
      var point = this.frontPoint();
      var characters = $gameMap.pointCharacters(point, true);
      for (var i = 0; i < characters.length; i++) {
        var event = characters[i];
        var dx = point.x - this.body._body.position.x;
        var dy = point.y - this.body._body.position.y;
        this._grabConstraint = Matter.Constraint.create({
          bodyA: this.body._body,
          pointA: { x: 0, y: 0 },
          bodyB: event.body._body,
          pointB: { x: point.x - event.body._body.position.x,
                    y: point.y - event.body._body.position.y },
          length: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)),
          stiffness: 0.7,
          damping: 0
        });
        Matter.World.add(PhysicsManager._world.world, this._grabConstraint);
        break;
      }
    }
  }
};

/**
 * 8方向入力対応.
 * @method getInputDirection
 */
/*Game_Player.prototype.getInputDirection = function () {
    let direction = Input.dir8;
    if (direction == 0 && $gameTemp.isDestinationValid()) {
        const x = $gameTemp.destinationX();
        const y = $gameTemp.destinationY();
        direction = this.findDirectionTo(x, y);
    }
    if (direction == 0) {
        $gameTemp.clearDestination();
    }
    return direction;
};*/

Game_Player.prototype.walkWaitCount = function () {
    return 1;
};

const _update = Game_Player.prototype.update;
Game_Player.prototype.update = function (sceneActive) {
    _update.call(this, sceneActive);
    if (sceneActive) {
        this.updateTrigger();
    }
};

Game_Player.prototype.updateCollide = function () {
    if (!this.body) {
        return;
    }
    if (this.body._collide.length > 0) {
        // console.log(this.body._collide);
    }
    this.body._collide = [];
};

Game_Player.prototype.updateTrigger = function () {
    if (!this.body || !this.canMove()) {
        return;
    }
    if (this.isTriggerWait()) {
        this._triggerWaitCount--;
        return;
    }
    //正面にいる剛体持ちキャラ
    // let characters = this.frontCharacters();
    // characters.forEach(function (character) {
    //     character.requestBalloon(1);
    // }, this);
    // if (Input.isPressed("ok") && characters.length > 0) {
    //     console.log(characters);
    // }

    //接触イベント
    // this.checkEventTriggerHere([1, 2]);
    // if ($gameMap.setupStartingEvent()) {
    //     console.log("here");
    //     this._triggerWaitCount = 10;
    //     return;
    // }
    //ボタンイベント
    if (this.triggerAction()) {
        this._triggerWaitCount = 20;
        return;
    }

    //イベント　
    // if (Input.isPressed("ok")) {
    //     let point = this.frontPoint();
    //     point.x = Math.floor(point.x);
    //     point.y = Math.floor(point.y);
    //     $gameMap.eventsXy(point.x, point.y).forEach(function (event) {
    //         if (event.isTriggerIn([0])) {
    //             event.start();
    //             this._triggerWaitCount = 10;
    //         }
    //     }, this);
    //     //カウンター対応
    //     if (!$gameMap.isAnyEventStarting() && $gameMap.isCounter(point.x, point.y)) {
    //         const d = this.direction();
    //         point.x = $gameMap.roundXWithDirection(point.x, d);
    //         point.y = $gameMap.roundYWithDirection(point.y, d);
    //         $gameMap.eventsXy(point.x, point.y).forEach(function (event) {
    //             if (event.isTriggerIn([0])) {
    //                 event.start();
    //                 this._triggerWaitCount = 10;
    //             }
    //         }, this);
    //     }


    // }
};

// //無効化
// Game_Player.prototype.updateDashing = function () {
// };
//無効化
Game_Player.prototype.updateVehicle = function () {};
//無効化
Game_Player.prototype.updateNonmoving = function (wasMoving) {};

Game_Player.prototype.metaData = function () {
    const data = {
        body: "circle"
    };
    if (!$gameParty.leader()) {
        return data;
    }
    const actorId = $gameParty.leader().actorId();
    const actor = $dataActors[actorId];
    return actor && Object.keys(actor.meta).length ? actor.meta : data;
};

// Game_Player.prototype.checkEventTriggerTouchBody = function(point){
//     if (this.canStartLocalEvents()) {
//         let characters = $gameMap.allCharactersHasBody(true);
//         characters = PhysicsManager.queryPoint(characters, point);
//         console.log(characters);
//         characters.forEach(function(event){
//             if(!event._eventId){
//                 return;
//             }
//             if(event.isTriggerIn([1,2]) && event.isNormalPriority()){
//                 event.start();
//             }
//         });
//     }
// };

// const _checkEventTriggerTouch = Game_Player.prototype.checkEventTriggerTouch;
// Game_Player.prototype.checkEventTriggerTouch = function (x, y) {
//     if (this.body) {
//         if (!$gameMap.isEventRunning() && this._trigger === 2) {
//             if (!this.isJumping() && this.isNormalPriority()) {
//                 if(PhysicsManager.queryPoint([$gamePlayer], {x:x, y:y}).length > 0){
//                     this.start();
//                 }
//             }
//         }
//     } else {
//         _checkEventTriggerTouch.call(this, x, y);
//     }
// };

var _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
  if (!$gameMap.isMatterFree()) _Game_Player_updateScroll.call(this, lastScrolledX, lastScrolledY);
};

},{}],5:[function(require,module,exports){

// window.MatterManager = require("./MatterManager.js");
// window.Matter_Body = require("./Matter_Body.js");
// window.Matter_World = require("./Matter_World.js");

// require("./Game_Character.js");
// require("./Game_Map.js");


window.Physics_Body = require("./_physics/body.js");
window.Physics_World = require("./_physics/world.js");
window.PhysicsManager = require("./_manager/physics.js");

require("./_game/map.js");
require("./_game/character.js");
require("./_game/event.js");
require("./_game/player.js");

require("./_scene/load.js");

(function () {})();

},{"./_game/character.js":1,"./_game/event.js":2,"./_game/map.js":3,"./_game/player.js":4,"./_manager/physics.js":6,"./_physics/body.js":7,"./_physics/world.js":8,"./_scene/load.js":9}],6:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// PhysicsManager
//

function PhysicsManager() {
    throw new Error("this is static class");
}
module.exports = PhysicsManager;

PhysicsManager.init = function () {
    if (this._world) {
        this._world.clear();
    }
    this._bodies = [];
    this._world = null;
};

PhysicsManager.update = function () {
    if (this._world) {
        this._world.update();
    }
};

PhysicsManager.createWorld = function (gx, gy) {
    this._world = new Physics_World(gx, gy);
    this.createWall();
    this.createCollisionTile();
};

PhysicsManager.addBody = function (physicsBody) {
    if (!physicsBody) {
        return;
    }
    this._world.addBody(physicsBody);
    this._bodies.push(physicsBody);
    if (physicsBody.character) {
        physicsBody.character._bodyIndex = this._bodies.length - 1;
    }
};

/**
 * 
 * @method body
 * @param index {Number}
 * @return {Rigit_Body}
 */
PhysicsManager.body = function (index) {
    if (!this._bodies || index == null) {
        return null;
    }
    return this._bodies[index];
};

PhysicsManager.createWall = function () {
    const w = $gameMap.width();
    const h = $gameMap.height();
    const option = {
        isStatic: true,
        friction: 0
    };
    const top = new Physics_Body({ coordinate: { w: w } });
    const bottom = new Physics_Body({ coordinate: { w: w } });
    const left = new Physics_Body({ coordinate: { h: h } });
    const right = new Physics_Body({ coordinate: { h: h } });
    top.move(w / 2, -0.5);
    bottom.move(w / 2, h + 0.5);
    left.move(-0.5, h / 2);
    right.move(w + 0.5, h / 2);
    this.addBody(top);
    this.addBody(bottom);
    this.addBody(left);
    this.addBody(right);
};

PhysicsManager.createCollisionTile = function () {
    const rects = $gameMap.collisionRects();
    rects.tiles.forEach(function (rect) {
        const body = new Physics_Body({ coordinate: { w: rect.w, h: rect.h } });
        body.move(rect.x + rect.w / 2, rect.y + rect.h / 2);
        body._body.render.visible = TMUseWallRender;
        this.addBody(body);
    }, this);
    const w = 0.2;
    rects.tops.forEach(function (rect) {
        const body = new Physics_Body({ coordinate: { w: rect.w, h: w } });
        body.move(rect.x + rect.w / 2, rect.y + w / 2);
        this.addBody(body);
    }, this);
    rects.bottoms.forEach(function (rect) {
        const body = new Physics_Body({ coordinate: { w: rect.w, h: w } });
        body.move(rect.x + rect.w / 2, rect.y + rect.h - w / 2);
        this.addBody(body);
    }, this);
    rects.lefts.forEach(function (rect) {
        const body = new Physics_Body({ coordinate: { w: w, h: rect.h } });
        body.move(rect.x + w / 2, rect.y + rect.h / 2);
        this.addBody(body);
    }, this);
    rects.rights.forEach(function (rect) {
        const body = new Physics_Body({ coordinate: { w: w, h: rect.h } });
        body.move(rect.x + rect.w - w / 2, rect.y + rect.h / 2);
        this.addBody(body);
    }, this);
//    console.log(rects);
};

PhysicsManager.queryPoint = function (characters, point) {
    if (!characters) {
        return [];
    }
    let bodies = [];
    characters.forEach(function (character) {
        if (!character || !character.body || !character.body._body) {
            return;
        }
        bodies.push(character.body._body);
    });
    let list = [];
    Matter.Query.point(bodies, point).forEach(function (body) {
        if (body._character) {
            list.push(body._character);
        }
    }, this);
    return list;
};

},{}],7:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Physics_Body
//

function Physics_Body() {
    this.initialize.apply(this, arguments);
}
module.exports = Physics_Body;

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Vertices = Matter.Vertices;

Physics_Body.prototype.initialize = function (data) {
    if (!data) {
        throw new Error("Physics_Body constructor needs paramater data");
    }
    this._character = data.character;
    this._body = null;
    this._collide = [];
    this._collideTerrain = false;

    this.createBody(data);
};

Physics_Body.prototype.mappingScale = function () {
    return $gameMap.tileWidth();
};

Object.defineProperties(Physics_Body.prototype, {
    x: {
        get: function () {
            return this._body ? this._body.position.x / this.mappingScale() : 0;
        },
        configurable: true
    },
    y: {
        get: function () {
            return this._body ? this._body.position.y / this.mappingScale() : 0;
        },
        configurable: true
    },
    vx: {
        get: function () {
            return this._body ? this._body.velocity.x / this.mappingScale() : 0;
        },
        configurable: true
    },
    vy: {
        get: function () {
            return this._body ? this._body.velocity.y / this.mappingScale() : 0;
        },
        configurable: true
    },
    catergory: {
        get: function () {
            return this._body ? this._body.collisionFilter.catergory : 0;
        },
        configurable: true
    },
    character: {
        get: function () {
            return this._character;
        },
        configurable: true
    }
});

Physics_Body.prototype.createBody = function (data) {
    this._body = null;
    const type = data.type ? data.type : "rectangle";
    const cood = this.setupCoordinate(data.coordinate);
    const option = this.setupOption(data.option);
    const scale = this.mappingScale();
    switch (type) {
        case "rectangle":
            this._body = Bodies.rectangle(0, 0, cood.w * scale, cood.h * scale, option);
            break;
        case "circle":
            this._body = Bodies.circle(0, 0, cood.r * scale, option);
            break;
        case "polygon":
            this._body = Bodies.polygon(0, 0, cood.sides, cood.radius, option);
            break;
    }
    if (this._body) {
        this._body._character = this._character;
    }
};

Physics_Body.prototype.defaultCoordinate = function () {
    return {
        w: 1,
        h: 1,
        r: 0.5
    };
};

Physics_Body.prototype.defaultOption = function () {
    return {
        density: 0.1,
        frictionAir: 0.1,
        restitution: 0.1,
        isStatic: true,
        inertia: Infinity
    };
};

Physics_Body.prototype.setupCoordinate = function (coordinate) {
    let data = this.defaultCoordinate();
    for (let prop in coordinate) {
        data[prop] = coordinate[prop];
    }
    return data;
};

Physics_Body.prototype.setupOption = function (option) {
    let data = this.defaultOption();
    for (let prop in option) {
        data[prop] = option[prop];
    }
    return data;
};

Physics_Body.prototype.move = function (x, y) {
    if (!this._body) {
        return;
    }
    Body.setPosition(this._body, {
        x: x * this.mappingScale(),
        y: y * this.mappingScale()
    });
};

Physics_Body.prototype.setVelocity = function (x, y) {
    if (!this._body) {
        return;
    }
    Body.setVelocity(this._body, {
        x: x * this.mappingScale(),
        y: y * this.mappingScale()
    });
};

Physics_Body.prototype.setAngle = function (angle) {
    if (!this._body) {
        return;
    }
    Body.setAngle(this._body, angle);
};

Physics_Body.prototype.setAngularVelocity = function(angle) {
    if (!this._body) return;
    Body.setAngularVelocity(this._body, angle);
};

Physics_Body.prototype.addVelocity = function (x, y) {
    if (!this._body) {
        return;
    }
    x = this._body.velocity.x + x;
    y = this._body.velocity.y + y;
    var v = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    if (this._character.maxSpeed() < v) {
        var d = v / this._character.maxSpeed();
        x /= d;
        y /= d;
    }
    Body.setVelocity(this._body, {
        x: x,
        y: y
    });
};

Physics_Body.prototype.velocity = function () {
    return this._body ? Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2)) : 0;
};

Physics_Body.prototype.distance = function (target) {
    if (!target || !target._body) {
        return 0;
    }
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};

Physics_Body.prototype.collide = function (character) {
    this._collide.push(character);
};

Physics_Body.prototype.collideTerrain = function (bool) {
    this._collideTerrain = bool;
};

Physics_Body.prototype.isCollidedTerrain = function () {
    return this._collideTerrain;
};

Physics_Body.prototype.frontBody = function () {
    if (!this._body) {
        return null;
    }
    let x = this._body.position.x;
    let y = this._body.position.y;
    if (this.character) {
        const angle = this.character._frontAngle;
        x -= Math.cos(angle) * this.mappingScale() * (0.5 + this._coordinate.r ? this._coordinate.r : this._coordinate.w);
        y += Math.sin(angle) * this.mappingScale() * (0.5 + this._coordinate.r ? this._coordinate.r : this._coordinate.h);
    }
    const bodies = Matter.Query.point(Matter.Composite.allBodies(PhysicsManager._world.world), { x: x, y: y });
//    console.log(bodies);
};

},{}],8:[function(require,module,exports){
"use strict";

//-----------------------------------------------------------------------------
// Physics_World
//

function Physics_World() {
    this.initialize.apply(this, arguments);
}
module.exports = Physics_World;

Object.defineProperties(Physics_World.prototype, {
    world: {
        get: function () {
            return this._engine ? this._engine.world : null;
        },
        configurable: true
    }
});

Physics_World.prototype.initialize = function (gx, gy) {
    this._engine = Matter.Engine.create();

    this.world.gravity.x = gx;
    this.world.gravity.y = gy;

    this.setupCollideEvent();
    this.setupLookCollider();
};

Physics_World.prototype.setupLookCollider = function () {
    this._lookCollider = [];
    const bodies = Matter.Composite.allBodies(this.world);
    bodies.forEach(function (body) {
        if (body.collisionFilter.category === 1) {
            this._lookCollider.push(body);
        }
    }, this);
};

Physics_World.prototype.setupCollideEvent = function () {
    Matter.Events.on(this._engine, 'collisionStart', function (event) {
        const pairs = event.pairs;
        pairs.forEach(function (pair, index) {
            const a = pair.bodyA;
            const b = pair.bodyB;
            const characterA = a._character;
            const characterB = b._character;
            if (!!characterA && !!characterB) {
                characterA.body.collide(characterB);
                characterB.body.collide(characterA);
            }
            if (!!characterA && !characterB && b.collisionFilter.category == 1) {
                characterA.body.collideTerrain(true);
            }
            if (!!characterB && !characterA && a.collisionFilter.category == 1) {
                characterB.body.collideTerrain(true);
            }
        }, this);
    });
};

Physics_World.prototype.setRender = function (w, h) {
    this._render = Matter.Render.create({
//        element: this._renderDom,
        engine: this._engine,
        options: {
            width: w,
            height: h,
            hasBounds: false,
            showAngleIndicator: false,
            showAxes: false,
            showCollisions: false,
            showSleeping: false,
            showConvexHulls: false,
            showVelocity: false,
            wireframes : TMShowWireFrame
        }
    });
    Matter.Render.run(this._render);
};

Physics_World.prototype.update = function () {
    if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
        return;
    }
    Matter.Engine.update(this._engine);
    this.setupLookCollider();
};

Physics_World.prototype.addBody = function (physicsBody) {
    Matter.World.add(this.world, physicsBody._body);
};

Physics_World.prototype.removeBody = function (physicsBody) {
    if (!physicsBody || !physicsBody._body) {
        return;
    }
    Matter.World.remove(this.world, physicsBody._body);
};

Physics_World.prototype.pointBodies = function (x, y) {
    const bodies = Matter.World.allBodies(this.world);
    return Matter.Query.point(bodies, { x: x, y: y });
};

Physics_World.prototype.clear = function () {
    Matter.World.clear(this.world, false);
    this._world = null;
};

},{}],9:[function(require,module,exports){
"use strict";

const _onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function () {
    $gameMap._isContinue = true;
    _onLoadSuccess.call(this);
};

},{}]},{},[5]);

(function() {

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //

  var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
  Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
    this.anchor.y = 0.5;
  };

  var _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
  Sprite_Character.prototype.updatePosition = function() {
    _Sprite_Character_updatePosition.call(this);
    this.y -= 0.5 * $gameMap.tileHeight();
    var rotation = this._character.screenAngle();
    if (rotation != null) this.rotation = rotation;
  };

  //-----------------------------------------------------------------------------
  // Sprite_Balloon
  //

  var _Sprite_Balloon_initMembers = Sprite_Balloon.prototype.initMembers;
  Sprite_Balloon.prototype.initMembers = function() {
    _Sprite_Balloon_initMembers.call(this);
    this.anchor.y = 0.5;
  };

  //-----------------------------------------------------------------------------
  // Sprite_SwipeArrow
  //

  function Sprite_SwipeArrow() {
    this.initialize.apply(this, arguments);
  }

  Sprite_SwipeArrow.prototype = Object.create(Sprite_Base.prototype);
  Sprite_SwipeArrow.prototype.constructor = Sprite_SwipeArrow;

  Sprite_SwipeArrow.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.bitmap = ImageManager.loadSystem('SwipeArrow');
    this.anchor.y = 0.5;
    this.z = 4;
    this.opacity = 160;
  };

  Sprite_SwipeArrow.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    var matterEvent = $gameMap.activeMatterEvent();
    this.visible = matterEvent && $gameMap.isMatterFlick();
    if (this.visible) {
      var x = matterEvent._realX + 0.5;
      var y = matterEvent._realY + 0.5;
      var dx = $gameMap.canvasToMatterMapX(TouchInput.x) - x;
      var dy = $gameMap.canvasToMatterMapY(TouchInput.y) - y;
      this.x = $gameMap.adjustX(x) * $gameMap.tileWidth();
      this.y = $gameMap.adjustY(y) * $gameMap.tileHeight();
      if (dx !== 0 || dy !== 0) {
        this.rotation = Math.atan2(dy, dx);
      }
      this.scale.x = Math.sqrt(dx * dx + dy * dy);
    }
  };

  //-----------------------------------------------------------------------------
  // Spriteset_Map
  //

  var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
  Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_createLowerLayer.call(this);
    this.createSwipeArrow();
  };

  Spriteset_Map.prototype.createSwipeArrow = function() {
    this._swipeArrowSprite = new Sprite_SwipeArrow();
    this._tilemap.addChild(this._swipeArrowSprite);
  };

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

    if (TMShowPlayerFront) this.drawPlayerFront();
};

Spriteset_Map.prototype.drawPlayerFront = function () {
    const point = $gamePlayer.frontPoint();
    const x = point.x * $gameMap.tileWidth();
    const y = point.y * $gameMap.tileHeight();
    this._physicsRender.bitmap.drawCircle(x, y, 5, "rgb(255, 0, 0)");
/*    $gameMap.allCharactersHasBody().forEach(function (character) {
        const point = character.frontPoint();
        const x = point.x * $gameMap.tileWidth();
        const y = point.y * $gameMap.tileHeight();
        this._physicsRender.bitmap.drawCircle(x, y, 5, "rgb(255, 0, 0)");
    }, this);*/
};

  //-----------------------------------------------------------------------------
  // Scene_Map
  //

  var _Scene_Map_initialize = Scene_Map.prototype.initialize;
  Scene_Map.prototype.initialize = function() {
    _Scene_Map_initialize.call(this);
    this._reserveMatterScrollX = 0;
    this._reserveMatterScrollY = 0;
  };

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this.updateMatterControl();
  };

  Scene_Map.prototype.updateMatterControl = function() {
    if ($gameMap.isMatterKeyboard()) {
      this.updateMatterKeyboard();
    } else {
      if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
        $gameMap.setActiveMatterEventId(null);
        return;
      }
      if ($gameMap.isMatterFlick()) {
        this.updateMatterFlick();
      } else {
        this.updateMatterFree();
      }
    }
  };

  Scene_Map.prototype.updateMatterKeyboard = function() {
  };

  Scene_Map.prototype.updateMatterFlick = function() {
    var matterEvent = $gameMap.activeMatterEvent();
    if (matterEvent) {
      if (!TouchInput.isPressed()) {
        matterEvent.moveFlick();
        $gameMap.setActiveMatterEventId(null);
      }
    } else {
      if (TouchInput.isTriggered()) this.updateActiveMatterEvent();
    }
  };

  Scene_Map.prototype.updateMatterFree = function() {
    var matterEvent = $gameMap.activeMatterEvent();
    if (matterEvent) {
      if (TouchInput.isPressed()) {
        matterEvent.moveFree();
      } else {
        $gameMap.setActiveMatterEventId(null);
      }
    } else {
      if (TouchInput.isTriggered()) {
        this.updateActiveMatterEvent();
        if (!$gameMap.activeMatterEvent()) this.updateMatterScrollInput();
      }
    }
    this.updateMatterScroll();
  };

  Scene_Map.prototype.updateActiveMatterEvent = function() {
    var x = $gameMap.canvasToMatterMapX(TouchInput.x);
    var y = $gameMap.canvasToMatterMapY(TouchInput.y);
    var events = $gameMap.pointCharacters({x: x, y: y}, false);
    for (var i = 0; i < events.length; i++) {
      if (events[i].constructor === Game_Player) {
        $gameMap.setActiveMatterEventId(-1);
        break;
      } else if ($gameMap.isMatterEventControl() && !events[i].isStatic()) {
        $gameMap.setActiveMatterEventId(events[i].eventId());
        break;
      }
    }
  };

  Scene_Map.prototype.updateMatterScrollInput = function() {
    if (TouchInput.x < TMScrollInputBorder) {
      this._reserveMatterScrollX = -1;
    } else if (TouchInput.x > Graphics.width - TMScrollInputBorder) {
      this._reserveMatterScrollX = 1;
    }
    if (TouchInput.y < TMScrollInputBorder) {
      this._reserveMatterScrollY = -1;
    } else if (TouchInput.y > Graphics.height - TMScrollInputBorder) {
      this._reserveMatterScrollY = 1;
    }
  };

  Scene_Map.prototype.updateMatterScroll = function() {
    if (this._reserveMatterScrollX || this._reserveMatterScrollY) {
      if (!TouchInput.isPressed()) {
        this._reserveMatterScrollX = 0;
        this._reserveMatterScrollY = 0;
      } else {
        this.updateMatterScrollInput();
        if (this._reserveMatterScrollX < 0) {
          $gameMap.scrollLeft(TMScrollSpeed);
        } else if (this._reserveMatterScrollX > 0) {
          $gameMap.scrollRight(TMScrollSpeed);
        }
        if (this._reserveMatterScrollY < 0) {
          $gameMap.scrollUp(TMScrollSpeed);
        } else if (this._reserveMatterScrollY > 0) {
          $gameMap.scrollDown(TMScrollSpeed);
        }
      }
    }
  };

})();