/*:
 * @plugindesc Matter.js使用プラグイン. 
 * @author ふしぎうさぎ
 *
 * 
 * @help
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
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

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

Game_Character.prototype.direction = function () {
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
};

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
    return this.realMoveSpeed() + 2;
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
    if (data.type == "rectangle") {
        this._bodyCenter.y = 1 - data.coordinate.h / 2;
    } else if (data.type == "circle") {
        this._bodyCenter.y = 1 - data.coordinate.r;
    }
    const body = new Physics_Body(data);
    PhysicsManager.addBody(body);
    this.locate(this._realX, this._realY);
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

},{}],2:[function(require,module,exports){
"use strict";
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
};

Game_Map.prototype.createWorld = function () {
    PhysicsManager.init();
    PhysicsManager.createWorld(this.gravityX(), this.gravityY());
};

Game_Map.prototype.gravityX = function () {
    return 0;
};

Game_Map.prototype.gravityY = function () {
    return 0;
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

},{}],4:[function(require,module,exports){
"use strict";

Game_Player.prototype.moveByInput = function () {
    if (!this.body || this.isMoving() || !this.canMove()) {
        return;
    }
    var d = this.getInputDirection();
    this.moveStraight(d);
};

/**
 * 8方向入力対応.
 * @method getInputDirection
 */
Game_Player.prototype.getInputDirection = function () {
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
};

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
    console.log(rects);
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

function Physics_Body() {
    this.initialize.apply(this, arguments);
}
module.exports = Physics_Body;

const Body = Matter.Body;
const Bodies = Matter.Bodies;

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
    console.log(bodies);
};

},{}],8:[function(require,module,exports){
"use strict";

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
