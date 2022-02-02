/**
 * Created by 七夕小雨 on 2019/1/7.
 * 动画组单个动画帧数据结构
 */
function DAnimRect(rd){
    var _sf = this;
    //相对原图X
    this.x = 0;
    //相对原图Y
    this.y = 0;
    //裁剪宽度
    this.width = 0;
    //裁剪高度
    this.height = 0;
    //偏移X
    this.dx = 0;
    //偏移Y
    this.dy = 0;
    //等待时间
    this.time = 0;
    //是否工具判定
    this.effective = false;
    //音效
    this.sound = "";
    //以你下音量
    this.volume = 80;
    //发射点
    this.points = [];
    //读取数据
    this.x = rd.readInt();
    this.y = rd.readInt();
    this.width = rd.readInt();
    this.height = rd.readInt();
    this.dx = rd.readInt();
    this.dy = rd.readInt();
    this.time = rd.readInt();

    this.effective = rd.readBool();

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.points.push(new APoint(rd));
    }

    this.sound = rd.readString();
    this.volume = rd.readShort();

    this.getRect = function(){
        return new IRect(_sf.x,_sf.y , _sf.x + _sf.width, _sf.y + _sf.height);
    };

    this.collisionRect = new ARect(rd);

}
/**
 * 动画帧发射位置
 */
function APoint(rd){
    this.x = 0;
    this.y = 0;

    this.x = rd.readInt();
    this.y = rd.readInt();
}
/**
 * 动画帧碰撞矩形
 */
function ARect(rd){
    //自动检测碰撞局域
    this.auto = rd.readBool();
    this.x = rd.readInt();
    this.y = rd.readInt();
    this.width = rd.readInt();
    this.height = rd.readInt();
}
/**
 * Created by 七夕小雨 on 2019/1/4.
 * 触发内容数据结构
 */
function DEvent(parent){
    //触发编号
    this.code = 0;
    //参数
    this.args = [];
    //子触发内容组
    this.events = null;
    //父触发组
    this.parent = parent;

    //读取数据
    this.read = function(rd){
        this.code = rd.readShort();
        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            this.args.push(rd.readString());
        }
        length = rd.readInt();
        if(length >= 0){
            this.events = [];
            for(i = 0;i<length;i++){
                var et = new DEvent(this);
                et.read(rd);
                this.events.push(et);
            }
        }
    };
}/**
 * Created by 七夕小雨 on 2019/1/4.
 * 有关工程条件的表达和逻辑
 */
function DIf(rd){
    //组合模式 0、AND 1、OR
    this.type = 0;
    //是否有除此之外的情况
    this.haveElse = true;
    //单个条件项
    this.items = [];

    this.tag = null;


    //读取数据
    if(rd != null){
        this.type = rd.readInt();
        this.haveElse = rd.readBool();
        var length = rd.readInt();

        for(var i = 0;i<length;i++){
            this.items.push(new DIfItem(rd));
        }
    }

    this.setOutData = function(s,o){
        for(var i = 0;i<this.items.length;i++){
            this.items[i].setOutData(s,o);
        }
    };


    /**
     * DIf 的运算结果
     * @returns {boolean}
     */
    this.result = function(){
        if(this.items.length <= 0){
            return true;
        }
        if(this.type == 0){//满足全部条件
            var num = 0;
            for(var i = 0;i<this.items.length;i++){
                if(this.items[i].result(this.tag)){
                    num += 1;
                }
            }
            return num >= this.items.length;
        }else if(this.type == 1){//满足任意条件
            for(i = 0;i<this.items.length;i++){
                if(this.items[i].result(this.tag)){
                    return true;
                }
            }
        }
        return false;

    }
}

/**
 * 单个条件分栏
 */
function DIfItem(rd){
    //条件分页
    this.type = 0;
    //值1
    this.num1Index = 0;
    //方法
    this.fuc = 0;
    //类型2
    this.type2 = 0;
    //值2
    this.num2 = "";
    //值2索引
    this.num2Index = 0;

    var _sf = null;
    var obj = null;

    this.setOutData = function(s,o){
        _sf = s;
        obj = o;
    };

    //读取数据
    if(rd != null){
        this.type = rd.readInt();
        this.num1Index = rd.readInt();
        this.fuc = rd.readInt();
        this.type2 = rd.readInt();
        this.num2 = rd.readString();
        this.num2Index = rd.readInt();
    }



    /**
     * 获得DIfItem 的运算结果
     * @returns {boolean}
     */
    this.result = function(tag){
        if(this.type == 0){//变量运算
            var val = RV.GameData.value[this.num1Index];
            if(val == null) return false;
            if(this.type2 == 0){//固定值
                if(val === true || val === false){
                    return this.operation(val , this.num2 == "1" , this.fuc);
                }else if(!isNaN(val)){
                    return this.operation(val , parseInt(this.num2) , this.fuc);
                }else if(typeof(val)=='string'){
                    return this.operation(val , this.num2 , this.fuc);
                }
            }else{//变量
                var val2 = RV.GameData.value[this.num2Index];
                if(val2 == null) return false;
                return this.operation(val , val2 , this.fuc);
            }
        }else if(this.type == 1){//敌人运算
            var enemy = RV.NowMap.findEnemy(this.num1Index);
            if(enemy == null) return false;
            if(this.fuc == 0){
                return enemy.getDir() == this.num2Index;
            }else if(this.fuc == 1){
                if(this.type2 == 0){
                    return enemy.hp >= enemy.getData().maxHp * (this.num2Index / 100);
                }else if(this.type2 == 1){
                    return enemy.hp <= enemy.getData().maxHp * (this.num2Index / 100);
                }
            }else if(this.fuc == 2){
                return enemy.findBuff(this.num2Index) != null;
            }else if(this.fuc == 3){
                return enemy.isDie;
            }
        }else if(this.type == 2){//角色的一堆判定
            if(this.fuc == 0){
                return RV.GameData.actor.getActorId() == this.num1Index;
            }else if(this.fuc == 1){
                return RV.GameData.actor.name == this.num2;
            }else if(this.fuc == 2){
                return RV.GameData.actor.skill.indexOf(this.num1Index) >= 0;
            }else if(this.fuc == 3){
                return RV.GameData.actor.equips[-1] == this.num1Index;
            }else if(this.fuc == 4){
                for(var key in RV.GameData.actor.equips){
                    if(RV.GameData.actor.equips[key] == this.num1Index && key != "-1"){
                        return true;
                    }
                }
                return false;
            }else if(this.fuc == 5){
                return RV.NowMap.getActor().getDir() == this.num1Index;
            }else if(this.fuc == 6){
                if(this.num2Index == 0){
                    return RV.GameData.actor.hp >= RV.GameData.actor.getMaxHP() * (this.num1Index / 100);
                }else if(this.num2Index == 1){
                    return RV.GameData.actor.hp <= RV.GameData.actor.getMaxHP() * (this.num1Index / 100);
                }
            }else if(this.fuc == 7){
                return RV.GameData.actor.findBuff( RV.NowSet.findStateId(this.num1Index).id);
            }else if(this.fuc == 8){
                return RV.IsDie;
            }
        }else if(this.type == 3){//其他判定
            if(this.fuc == 0){
                if(this.num2Index == 0){
                    return RV.GameData.money >= this.num1Index;
                }else if(this.num2Index == 1){
                    return RV.GameData.money < this.num1Index;
                }
            }else if(this.fuc == 1){
                return RV.GameData.findItem(0,this.num1Index) != null;
            }else if(this.fuc == 2){
                return RV.GameData.findItem(1,this.num1Index) != null;
            }else if(this.fuc == 3){
                return RV.GameData.findItem(2,this.num1Index) != null;
            }else if(this.fuc == 4){
                if(this.num2Index == 0){
                    return IInput.isKeyDown(this.num1Index);
                }else{
                    return IInput.isKeyPress(this.num1Index);
                }
            }else if(this.fuc == 5){
                var rect = this.num2.split(",");
                if(this.num2Index == 0){
                    return IInput.up && IInput.x >= parseInt(rect[0]) && IInput.y >= parseInt(rect[1]) &&
                        IInput.x <= parseInt(rect[0]) + parseInt(rect[2]) &&
                        IInput.y <= parseInt(rect[1]) + parseInt(rect[3]);
                }else if(this.num2Index == 1){
                    return IInput.down && IInput.x >= parseInt(rect[0]) && IInput.y >= parseInt(rect[1]) &&
                        IInput.x <= parseInt(rect[0]) + parseInt(rect[2]) &&
                        IInput.y <= parseInt(rect[1]) + parseInt(rect[3]);
                }
            }else if(this.fuc == 6){
                if(this.num1Index == 2){
                    return IVal.Platform == "Android";
                }else if(this.num1Index == 3){
                    return IVal.Platform == "iOS";
                }else if(this.num1Index == 4){
                    return IVal.Platform == "WeiXin";
                }else if(this.num1Index == 0){
                    return IVal.Platform == "Windows";
                }else if(this.num1Index == 1){
                    return IVal.Platform == "Web";
                }
            }else if(this.fuc == 7){
                var end = null;
                try{
                    end = eval(this.num2);
                    if(typeof end == "boolean"){
                        return end;
                    }else{
                        return end != null;
                    }
                }catch(e){
                    return false;
                }
            }else if(this.fuc == 8){
                if(tag == null) return false;
                return tag.getSwitch(this.num1Index);
            }
        }
        return false;
    };

    /**
     * 数值操作法
     * @param value1 数值1
     * @param value2 数值2
     * @param func 比较方法
     * @returns {boolean} 是否符合预期
     */
    this.operation = function(value1 , value2 , func){
        if(func == 0){
            return value1 == value2;
        }else if(func == 1){
            return value1 != value2;
        }else if(func == 2){
            return value1 > value2;
        }else if(func == 3){
            return value1 < value2;
        }else if(func == 4){
            return value1 >= value2;
        }else if(func == 5){
            return value1 <= value2;
        }
        return false;
    }
}/**
 * Created by 七夕小雨 on 2019/1/4.
 * 工程数据·总结构
 */
function DProject(onload){

    var _sf = this;
    //工程名称
    this.name = "";
    //工程唯一Key
    this.key = "";
    //工程数据版本号
    this.code = 0;
    //工程分辨率·宽度
    this.gameWidth = 960;
    //工程分辨率·高度
    this.gameHeight = 540;
    //工程游戏类型 0、ACT 1、ARPG 2、AVG
    this.gameType = 0;
    //起始地图编号
    this.startId = 1;
    //工程所属用户
    this.owner = "";
    //工程是否被锁定
    this.isLock = false;
    //工程地图数据
    this.maps = [];
    //工程变量数据
    this.values = [];

    //读取工程数据文件
    var file = "Game.ifaction";
    var rd = new IRWFile(file);
    //考虑到Web端文件为异步读取，所以需要设置读取回调给IRWFile;
    var onloadE = onload;

    //读取工程数据
    rd.onload = function(){
        var ms = rd.readMS(8);
        if(ms == "IFACTION"){
            _sf.name = rd.readString();
            _sf.key = rd.readString();
            _sf.code = rd.readInt();rd.readInt();
            _sf.gameWidth = rd.readInt();
            _sf.gameHeight = rd.readInt();
            _sf.gameType = rd.readInt();
            _sf.startId = rd.readInt();rd.readInt();rd.readInt();

            _sf.owner = rd.readString();
            _sf.isLock = rd.readBool();

            var length = rd.readInt();
            for(var i = 0;i<length;i++){
                var mp = new DStory(rd);
                _sf.maps.push(mp);
            }

            length = rd.readInt();
            for(i = 0;i<length;i++){
                var val = new DValue(rd);
                _sf.values.push(val);
            }

            onloadE();

        }
    };

    /**
     * 初始化变量库
     * @param data 原始变量数据
     * @returns {Array} 可用于游戏中使用的变量数据
     */
    this.initValue = function(data){
        var vals = [];
        for(var i = 0;i< _sf.values.length;i++){
            var value = _sf.values[i].defValue;
            if(_sf.values[i].type == 0){
                value = value == "1";
            }else if(_sf.values[i].type == 1){
                value = parseInt(value);
            }
            if(_sf.values[i].staticValue && data != null && data[_sf.values[i].id] != null){
                vals[_sf.values[i].id] = data[_sf.values[i].id];
            }else{
                vals[_sf.values[i].id] = value;
            }

        }
        return vals;
    };

    /**
     * 寻找 ID号对应的地图
     * @param id 地图ID
     * @returns {DMap} 地图数据实例
     */
    this.findMap = function(id){
        for(var i = 0;i<_sf.maps.length;i++){
            if(_sf.maps[i].id == id){
                return _sf.maps[i];
            }
        }
        return null;
    };


}/**
 * Created by 七夕小雨 on 2020/7/15.
 */
function DRegion(parent){
    var _sf = this;

    this.parent = parent;
    this.type = 0;
    this.code = 0;
    this.args = [];

    this.events = [];
    this.regions = [];

    this.read = function(rd){
        _sf.type = rd.readShort();
        _sf.code = rd.readShort();

        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            _sf.args[i] = rd.readString();
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            var e = new DEvent();
            e.read(rd);
            _sf.events.push(e);
        }
        length = rd.readInt();
        if(length > 0){
            for(i = 0;i<length;i++){
                var g = new DRegion(_sf);
                g.read(rd);
                _sf.regions.push(g);
            }
        }

        length = rd.readInt();
        for(i = 0;i<length;i++){
            rd.readInt();rd.readBool();
        }

        length = rd.readInt();
        for(i = 0;i<length;i++){
            rd.readInt();rd.readBool();rd.readBool();
        }

    }

}/**
 * Created by 七夕小雨 on 2019/3/14.
 * 关键帧动画
 */
function DResAnimFrame(rd){
    //动画组
    this.anims = [];
    //关键帧动作集合
    this.actionList = [];

    //动画ID
    this.id = rd.readShort();
    //动画名称
    this.name = rd.readString();
    //动画说明
    this.msg = rd.readString();
    //动画出现位置
    this.point = new DResAnimPoint(rd);
    //动画文件
    this.file = rd.readString();

    //读入动画组与关键帧动作合计
    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.anims.push(new DAnimRect(rd));
    }

    length = rd.readInt();
    for(i = 0;i<length;i++){
        this.actionList.push(new DResAnimFrameAction(rd));
    }

}/**
 * Created by 七夕小雨 on 2019/3/14.
 * 关键帧动画动作数据结构
 */
function DResAnimFrameAction(rd){
    //闪烁颜色
    this.color = [0,0,0,0];
    //角色闪烁颜色
    this.actorColor = [0,0,0,0];

    //帧数
    this.index = rd.readShort();
    //是否存在判定区域
    this.isAtk = rd.readBool();
    //区域X
    this.AtkX = rd.readShort();
    //区域Y
    this.AtkY = rd.readShort();
    //区域宽度
    this.AtkWidth = rd.readShort();
    //区域高度
    this.AtkHeight = rd.readShort();
    //是否闪烁
    this.isFlash = rd.readBool();
    this.color[0] = rd.readShort();
    this.color[1] = rd.readShort();
    this.color[2] = rd.readShort();
    this.color[3] = rd.readShort();

    //闪烁完成时间
    this.flashTime = rd.readShort();
    //是否透明
    this.isOpactiy = rd.readBool();
    //不透明度
    this.opacity = rd.readShort();
    //透明完成时间
    this.opacityTime = rd.readShort();

    //是否缩放
    this.isZoom = rd.readBool();
    //缩放X坐标
    this.zoomX = rd.readShort();
    //缩放Y坐标
    this.zoomY = rd.readShort();
    //缩放完成时间
    this.zoomTime = rd.readShort();
    //是否角色闪烁
    this.isActorFlash = rd.readBool();
    this.actorColor[0] = rd.readShort();
    this.actorColor[1] = rd.readShort();
    this.actorColor[2] = rd.readShort();
    this.actorColor[3] = rd.readShort();
    //角色闪烁完成时间
    this.actorFlashTime = rd.readShort();


}/**
 * Created by 七夕小雨 on 2019/3/14.
 * 粒子动画数据结构
 */
function DResAnimParticle(rd){
    //粒子文件组
    this.files = [];
    //动画ID
    this.id = rd.readShort();
    //动画名称
    this.name = rd.readString();
    //动画说明
    this.msg = rd.readString();
    //动画出现位置
    this.point = new DResAnimPoint(rd);

    //发射类型
    this.launchType = rd.readShort();
    //发射半径
    this.radius = rd.readShort();
    //是否拥有重力
    this.isGravity = rd.readBool();
    //区域宽度
    this.width = rd.readShort();
    //区域高度
    this.height = rd.readShort();
    //发射距离
    this.distance = rd.readShort();
    //发射方向
    this.dir = rd.readShort();
    //衰弱时间
    this.time = rd.readShort();
    //粒子数量
    this.number = rd.readShort();
    //储存结构文件
    this.file = rd.readString();

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.files.push(rd.readString());
    }
    //粒子音效
    this.sound = new DSetSound(rd);
}/**
 * Created by 七夕小雨 on 2019/3/14.
 * 动画显示位置数据结构
 */
function DResAnimPoint(rd){
    //位置类型，相对、绝对
    this.type = rd.readShort();
    //X坐标
    this.x = rd.readShort();
    //Y坐标
    this.y = rd.readShort();
    //相对方向
    this.dir = rd.readShort();

}/**
 * Created by 七夕小雨 on 2019/1/8.
 * 设置的数据结构
 */
function DSet(onload){
    var onloadE = onload;

    //设置数据版本号
    this.code = 0;
    //总设
    this.setAll = null;
    //CG鉴赏
    this.setCG = [];
    //BGM鉴赏
    this.setBGM = [];
    //动画
    this.setAnim = [];
    //通用触发器
    this.setEvent = [];

    //对话框
    this.setMessage = null;

    var _sf = this;

    //读取数据
    var rd = new IRWFile("Setting.ifset");
    rd.onload = function(){

        _sf.code = rd.readShort();
        _sf.setAll = new DSetAll(rd);
        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            var temp = new DSetCG(rd);
            _sf.setCG[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetBGM(rd);
            _sf.setBGM[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            var type = rd.readShort();
            if(type == -3310){
                temp = new DResAnimFrame(rd);
                _sf.setAnim[temp.id] = temp;
            }else if(type == -2801){
                temp = new DResAnimParticle(rd);
                _sf.setAnim[temp.id] = temp;
            }
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetEvent(rd);
            _sf.setEvent[temp.id] = temp;
        }

        _sf.setMessage = new DSetMessage(rd);
        onloadE();
    };

    /**
     * 寻找属性设置
     * @param id
     * @returns {DSetAttribute}
     */
    this.findAttributeId = function(id){
        return _sf.setAttribute[id];
    };
    /**
     * 寻找公共触发器
     * @param id
     * @returns {DSetEvent}
     */
    this.findEventId = function(id){
        return _sf.setEvent[id];
    };

    /**
     * 寻找物品
     * @param id
     * @returns {DSetItem}
     */
    this.findItemId = function(id){
        return _sf.setItem[id];
    };

    /**
     * 通过ID号获得敌人的数据
     * @param id 敌人的数据
     * @returns {DSetEnemy}
     */
    this.findEnemyId = function(id){
        return _sf.setEnemy[id];
    };
    /**
     * 寻找武器
     * @param id
     * @returns {DSetArms}
     */
    this.findArmsId = function(id){
        return _sf.setArms[id];
    };
    /**
     * 寻找防具
     * @param id
     * @returns {DSetArmor}
     */
    this.findArmorId = function(id){
        return _sf.setArmor[id];
    };
    /**
     * 通过ID号获得技能的数据
     * @param id 敌人的数据
     * @returns {DSetSkill}
     */
    this.findSkillId = function(id){
        return _sf.setSkill[id];
    };
    /**
     * 寻找角色
     * @param id
     * @returns {DSetActor}
     */
    this.findActorId = function(id){
        return _sf.setActor[id];
    };
    /**
     * 寻找子弹
     * @param id
     * @returns {DSetBullet}
     */
    this.findBullet = function(id){
        return _sf.setBullet[id];
    };
    /**
     * 寻找交互块
     * @param id
     * @returns {DSetInteractionBlock}
     */
    this.findBlockId = function(id) {
        return _sf.setBlock[id];
    };
    /**
     * 寻找BUFF
     * @param id
     * @returns {DSetState}
     */
    this.findStateId = function(id){
        return _sf.setState[id];
    };
    /**
     * 寻找动画配置数据
     * @param id
     * @returns DResAnimFrame
     */
    this.findResAnim = function(id){
        return _sf.setAnim[id];
    }

}/**
 * Created by 七夕小雨 on 2019/1/8.
 * 设置·总设数据结构
 */
function DSetAll(rd){

    //按键映射
    this.key = new Array(30);

    rd.readShort();rd.readShort();
    rd.readShort();rd.readShort();
    rd.readShort();
    rd.readBool();

    //标题文件
    this.titleFile = rd.readString();

    this.titleMusic = new DSetSound(rd);rd.readBool();
    rd.readShort();rd.readShort();new DSetSound(rd);
    rd.readBool();rd.readShort();rd.readShort();rd.readShort();
    rd.readBool();rd.readShort();


    //音效相关
    this.enterSound = new DSetSound(rd);
    this.cancelSound = new DSetSound(rd);
    this.selectSound = new DSetSound(rd);
    new DSetSound(rd);new DSetSound(rd);

    for(var i = 0; i < 30;i++){
        this.key[i] = rd.readShort();
    }

    this.fontSize = rd.readInt();
    this.fontColor = new DColor(rd);

    this.talkUIid = rd.readInt();
    this.MsgUIid = rd.readInt();
    this.MsgIfid = rd.readInt();
    this.Menuid = rd.readInt();
}/**
 * Created by 七夕小雨 on 2020/7/15.
 */
function DSetBGM(rd){
    this.id = rd.readInt();
    this.name = rd.readString();
    this.text = rd.readString();
    this.cover = rd.readString();
    this.music = rd.readString();
    this.speed = rd.readInt();
}/**
 * Created by 七夕小雨 on 2020/7/15.
 */
function DSetCG(rd){
    this.id = rd.readInt();
    this.name = rd.readString();
    this.text = rd.readString();
    this.cover = rd.readString();
    this.type = rd.readInt();
    this.pic = rd.readString();
    this.mapId = rd.readInt();
    this.autoTimes = rd.readInt();
}/**
 * Created by 七夕小雨 on 2019/1/8.
 * 设置·公共触发器
 */
function DSetEvent(rd){
    this.id = rd.readInt();
    this.name = rd.readString();

    //执行逻辑
    this.logic = new DIf(rd);
    //是否同步执行
    this.isParallel = rd.readBool();
    //是否自动执行
    this.autoRun = rd.readBool();

    //触发器内容
    this.events = [];

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        var et = new DEvent();
        et.read(rd);
        this.events.push(et);
    }

    /**
     * 执行触发器
     */
    this.doEvent = function(){
        if(this.logic.result()){
            //释放在地图的自动执行并行通用触发器
            if(this.autoRun && this.isParallel && !RF.FindOtherEvent("public_event_" + this.id)){
                RF.AddOtherEvent(this.events , "public_event_" + this.id , -1);
            }else if(!this.autoRun && this.isParallel){//通过物品、敌人死亡，怪物，或者在通用触发器中间执行的触发器
                RF.AddOtherEvent(this.events , null , -1);
            }else if(!this.isParallel){//合并在主循环执行的
                RV.InterpreterMain.addEvents(this.events);
            }
        }
    }
}/**
 * Created by 七夕小雨 on 2021/3/26.
 */
function DSetMessage(rd){
    var _sf = this;
    this.dx = rd.readInt();
    this.topY = rd.readInt();
    this.centerY = rd.readInt();
    this.bottomY = rd.readInt();

    this.spacingH = rd.readInt() / 100;
    this.spacingV = rd.readInt() / 100;

    this.cursorPath = rd.readString() ;
    this.cursorX = rd.readInt();
    this.cursorY = rd.readInt();
    this.cursorSpeed = rd.readInt();
    this.cursorDir = rd.readInt();

    this.nameBlock = new DSetMsgBlock(rd);
    this.nameText = new DSetMsgText(rd);
    this.msgBlock = new DSetMsgBlock(rd);
    this.msgText = new DSetMsgText(rd);
    this.buttonJump = new DSetMsgButton(rd);
    this.buttonAuto = new DSetMsgButton(rd);
    this.buttonMenu = new DSetMsgButton(rd);
}

function DSetMsgBlock(rd){
    this.type = rd.readShort();
    this.path1 = rd.readString();
    this.x1 = rd.readInt();
    this.x2 = rd.readInt();
    this.y1 = rd.readInt();
    this.y2 = rd.readInt();

    this.width = rd.readInt();
    this.height = rd.readInt();

    this.path2 = rd.readString();
    this.dx = rd.readInt();
    this.dy = rd.readInt();

}

function DSetMsgText(rd){
    this.textSize = rd.readShort();
    this.textColor = new DColor(rd);
    this.effect = rd.readShort();
    this.effectColor = new DColor(rd);
    this.type = rd.readShort();
    this.dx = rd.readInt();
    this.dy = rd.readInt();
    this.width = rd.readInt();
    this.height = rd.readInt();

}

function DSetMsgButton(rd){
    this.isVisible = rd.readBool();
    this.path1 = rd.readString();
    this.path2 = rd.readString();
    this.text = rd.readString();
    this.textSize = rd.readShort();
    this.textColor = new DColor(rd);
    this.tx = rd.readInt();
    this.ty = rd.readInt();
    this.x = rd.readInt();
    this.y = rd.readInt();
}/**
 * Created by 七夕小雨 on 2019/3/14.
 * 音效音乐数据结构
 */
function DSetSound(rd){
    //文件
    this.file = "";
    //音量
    this.volume = 80;

    if(rd != null){
        this.file = rd.readString();
        this.volume = rd.readShort();
    }

    /**
     * 播放
     * @param type 0、播放BGM 1、播放BGS 2、播放SE
     */
    this.play = function(type){
        if(this.file == "") return;
        if(type == null) type = 2;
        if(type == 0){
            RV.GameSet.playBGM("Audio/" + this.file , this.volume);
        }else if(type == 1){
            RV.GameSet.playBGS("Audio/" + this.file , this.volume);
        }else if(type == 2){
            RV.GameSet.playSE("Audio/" + this.file , this.volume);
        }
    }

}/**
 * Created by 七夕小雨 on 2019/1/4.
 * 地图数据
 */
function DStory(rd){
    var _sf = this;
    //地图ID
    this.id = 0;
    //地图名称
    this.name = "";
    //是否是指令模式
    this.isHard = false;
    //地图的父ID（游戏无效）
    this.fid = -1;
    //队列排序
    this.order = 0;
    //事件集合
    this.events = [];
    //区域集合
    this.regions = [];

    //读取数据
    this.id = rd.readShort();
    this.name = rd.readString();
    this.isHard = rd.readBool();
    this.fid = rd.readShort();
    this.order = rd.readShort();

    var length = rd.readInt();
    if(this.isHard){
        for(var i = 0;i<length;i++){
            var e = new DEvent();
            e.read(rd);
            this.events.push(e);
        }
    }else{
        for(i = 0;i<length;i++){
            e = new DRegion(null);
            e.read(rd);
            this.regions.push(e);
        }
        regionsToEvents();
    }


    function regionsToEvents(){
        for(var i = 0;i< _sf.regions.length;i++){
            _sf.events = _sf.events.concat(regionOne(_sf.regions[i], null));
        }
    }

    function regionOne(region,event){
        var events = [];
        if(region.events.length > 0){
            events = events.concat(region.events);
        }else{
            var e = new DEvent(event);
            e.code = region.code;
            e.args = region.args;
            e.events = [];
            for(var i = 0;i<region.regions.length;i++){
                e.events = e.events.concat(regionOne(region.regions[i],e));
            }
            events.push(e);
        }
        return events;
    }


}/**
 * Created by 七夕小雨 on 2019/1/4.
 * 变量的数据结构
 */
function DValue(rd){
    //变量ID
    this.id = rd.readInt();
    //变量名称
    this.name = rd.readString();
    //变量类型
    this.type = rd.readInt();
    //变量默认值
    this.defValue = rd.readString();
    //是否是多周目变量
    this.staticValue = rd.readBool();
}/**
 * Created by 七夕小雨 on 2020/7/16.
 */
function GCanvas(){


    this.pics = [];
    this.anims = [];

    this.weatherIndex = 0;

}/**
 * GMain 游戏总数据
 * Created by 七夕小雨 on 2019/3/14.
 */
function GMain(){
    var _sf = this;
    //变量
    this.value = [];

    //当前的剧情Id
    this.storyId = 0;
    //条件选择队列
    this.storySelectInfo = [];
    //当前解释器索引位置
    this.iIndex = -1;
    //当前解释器指令
    this.ievent = -1;
    //当前画面所有信息
    this.canvasData = null;
    //当前菜单
    this.menu = 0;
    //当前播放剧情CG序号
    this.playCGIndex = -1;
    //当前播放BGM序号
    this.playBGMIndex = -1;
    //跳转剧情次数
    this.jumpTime = 0;
    this.currentCG = null;
    //剧情回顾内容
    this.msgLog = [];


    /**
     * 初始化游戏数据
     */
    this.init = function(){
        if(RV.NowProject == null) return;
        // var data = IRWFile.LoadKV(RV.NowProject.key + "_" + -1);
        var data = IRWFile.LoadKV(RV.NowProject.key);
        this.value = RV.NowProject.initValue(data != null ? data.value : null);
        this.storyId = RV.NowProject.startId;
        this.storySelectInfo = [];
        this.iIndex = -1;
        this.ievent = -1;
        this.msgLog = [];

        _sf.recoverGlobalValue();
        this.canvasData = new GCanvas();
    };

    this.recoverGlobalValue = function (){
        for(var i = 0; i<_sf.value.length; i++){
            for(var key in RV.SaveInfo.globalValue){
                if(RV.SaveInfo.globalValue[key] != null && i == RV.SaveInfo.globalValue[key].id){
                    _sf.value[i] = RV.SaveInfo.globalValue[key].value;
                }
            }
        }
    };
    /**
     * 保存游戏数据
     */
    this.save = function(index){
        RV.NowCanvas.save();
        this.storySelectInfo = RV.InterpreterMain.storySelectInfo;
        this.iIndex = RV.InterpreterMain.iIndex;
        this.ievent = RV.InterpreterMain.ievent;
        var info = {

            value : this.value,
            storyId : this.storyId,
            msgLog:this.msgLog,

            bgmFile : RV.GameSet.nowBGMFile,
            bgmVolume : RV.GameSet.nowBGMVolume,
            bgsFile : RV.GameSet.nowBGSFile,
            bgsVolume : RV.GameSet.nowBGSVolume,

            canvasData : this.canvasData,
            storySelectInfo : this.storySelectInfo,
            iIndex : this.iIndex,
            ievent : this.ievent

        };
        IRWFile.SaveKV(RV.NowProject.key + "_" + index,info);
        // IRWFile.SaveKV(RV.NowProject.key + "_" + -1,info);
    };

    this.canvasLoad = function(index){
        var info = IRWFile.LoadKV(RV.NowProject.key + "_" + index);
        if(info != null){
            this.canvasData = info.canvasData;
            return true;
        }
        return false;
    };

    /**
     * 读取游戏数据
     */
    this.load = function(index){
        var info = IRWFile.LoadKV(RV.NowProject.key + "_" + index);
        if(info != null){
            this.value = RV.NowProject.initValue(info.value);
            for(var key in info.value){
                this.value[key] = info.value[key];
            }
            _sf.recoverGlobalValue();
            this.storyId = info.storyId;
            this.msgLog = info.msgLog;
            //复原BGM，BGS
            RV.GameSet.playBGM(info.bgmFile,info.bgmVolume);
            RV.GameSet.playBGS(info.bgsFile,info.bgsVolume);
            this.canvasData = info.canvasData;
            this.storySelectInfo = info.storySelectInfo;
            this.iIndex = info.iIndex;
            this.ievent = info.ievent;


            return true;
        }

        return false;

    };

    this.getMapData = function(){
        return this.canvasData;
    };

    this.clearMapData = function(){
        this.canvasData = null;
    };


    /**
     * 获得变量对应值
     * @param id 变量ID
     * @returns {string|*}
     */
    this.getValues = function(id){
        var val = this.value[id];
        if(val === true || val === false){
            return val ? "ON" : "OFF";
        }else if(!isNaN(val)){
            return val;
        }else if(typeof(val)=='string'){
            var str = val.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",CharToAScII(60003)+  "[$1]");
            var end = "";
            while(true){
                if(str.length <= 0){
                    break;
                }
                var min = str.substring(0,1);
                str = str.substring(1,str.length);
                var c = min.charCodeAt(0);
                if(c == 60003){
                    var returnS = TextToTemp(str , "[","]","\\[([a-zA-Z0-9-_]+)]");
                    str = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
                }else{
                    end += min;
                }
            }
            return end;
        }
        return "null";
    };

    /**
     * 文字正则提取
     * @param mainText 需要提取的字符串
     * @param s 前置特殊标志
     * @param e 后置特殊标志
     * @param rex 正则表达式
     * @returns {*[]} 提取后的内容
     */
    function TextToTemp( mainText, s, e, rex){
        var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
        mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
        var temp1 = tmp.replaceAll(rex, "$1");
        var temp_2 = temp1.replaceAll(" ", "");
        var temp_e = temp_2.replaceAll("，", ",");
        return [temp_e,mainText];
    }

    /**
     * char转换AscII
     * @param num char码
     * @returns {string}
     */
    function CharToAScII( num) {
        return String.fromCharCode(num);
    }

    /**
     * 获得变量对象
     * @param id 变量ID
     * @param value 如果变量为空值，设置一个默认变量
     * @returns {*}
     */
    this.getValue = function(id , value){
        var val = this.value[id];
        if(val == null){
            return value;
        }
        return val;
    };

    /**
     * 获得变量
     * @param id 变量ID
     * @param value 如果变量为空值，设置一个默认变量
     * @returns {*}
     */
    this.getValueNum = function(id,value){
        var val = this.value[id];
        if(val == null){
            return value;
        }
        if(!isNaN(val)){
            return val;
        }
        return value;
    };

    /**
     * 向剧情回顾中添加文本
     * @param msg 剧情文本对象
     * @returns {*}
     */
    this.setMsgLog = function(msg){
        if(this.msgLog.length >= 50){
            this.msgLog.shift();
        }
        this.msgLog.push(msg);
    }

}


/**
 * 是否有存档；
 * @returns {boolean}
 */
GMain.haveFile = function(index){
    if(RV.NowProject != null){
        var data = IRWFile.LoadKV(RV.NowProject.key + "_" + index);
        return data != null;
    }
    return false;
};
/**
 * Created by 七夕小雨 on 2020/7/30.
 */
function GSaveData(){

    var _sf = this;
    this.list = {};
    //全局变量（二周目变量）
    this.globalValue = [];

    this.loadAll = function(){
        var info = IRWFile.LoadKV(RV.NowProject.key + "_saveInfo");
        if(info != null){
            _sf.list = info.list;
            _sf.globalValue = info.globalValue;
        }else{
            _sf.list = {};
            _sf.globalValue = [];
        }
    };

    this.load = function(index){
        var data = new GMain();
        data.load(index);
        return data;
    };

    this.canvasLoad = function(index){
        var canvasData = new GMain();
        canvasData.canvasLoad(index);
        return canvasData;
    };

    this.saveAll = function(){
        var tempGroup = {
            list : _sf.list,
            globalValue : _sf.globalValue
        }
        IRWFile.SaveKV(RV.NowProject.key + "_saveInfo",tempGroup);
    };

    this.save = function(index){
        _sf.globalValue = _sf.filterGlobalValue(RV.GameData.value);
        this.list[index] = {
            gameTime : RF.GetTime(),
            storyId : RV.GameData.storyId
        };
        RV.GameData.save(index);
        _sf.saveAll();
    };

    this.filterGlobalValue = function (data){
        var vals = [];
        for(var i = 0;i< RV.NowProject.values.length;i++){
            if(RV.NowProject.values[i].staticValue && data != null && data[RV.NowProject.values[i].id] != null){
                var tempValue = {
                    id : RV.NowProject.values[i].id,
                    value : data[RV.NowProject.values[i].id]
                }
                vals.push(tempValue);
            }
        }
        return vals;
    }
}/**
 * Created by 七夕小雨 on 2019/6/12 0012.
 * 游戏设定部分
 */
function GSet(){
    var _sf = this;
    //当前播放的BGM文件
    this.nowBGMFile = "";
    //当前播放的BGS文件
    this.nowBGSFile = "";
    //当前BGM音量
    this.nowBGMVolume = 100;
    //当前BGS音量
    this.nowBGSVolume = 100;
    //当前Voice音量
    this.nowVoiceVolume = 100;
    //当前获得CG列表
    this.nowCGList = [];
    //当前获得BGM列表
    this.nowBGMList = [];

    //当前文字阅读速度
    this.textSpeed = 3;
    //当前自动阅读文字显示速度
    this.autoSpeed = 3;




    //相对音乐音量
    var musicVolume = 100;
    //相对音效音量
    var soundVolume = 100;
    //相对语音音量
    var voiceVolume = 100;


    //修改音乐音量
    Object.defineProperty(this, "BGMVolume", {
        get: function () {
            return musicVolume;
        },
        set:function(value){
            musicVolume = value;
            _sf.setBGMVolume(_sf.nowBGMVolume * (musicVolume / 100));
            _sf.setBGSVolume(_sf.nowBGSVolume * (musicVolume / 100));
        }
    });
    //修改音效音量
    Object.defineProperty(this, "SEVolume", {
        get: function () {
            return soundVolume;
        },
        set:function(value){
            soundVolume = value;
        }
    });
    //修改语音音量
    Object.defineProperty(this, "VoiceVolume", {
        get: function () {
            return voiceVolume;
        },
        set:function(value){
            voiceVolume = value;
        }
    });

    //添加CG
    this.addCG = function(id){
        for(var key in RV.NowSet.setCG){
            if(RV.NowSet.setCG.hasOwnProperty(key)){
                var tempId = RV.NowSet.setCG[key].id;
            }
            if(tempId == id && _sf.nowCGList.indexOf(id) == -1){
                _sf.nowCGList.push(tempId);
            }
        }
        _sf.save();
    };
    //添加BGM
    this.addBGM = function(id){
        for(var key in RV.NowSet.setBGM){
            if(RV.NowSet.setBGM.hasOwnProperty(key)){
                var tempId = RV.NowSet.setBGM[key].id;
            }
            if(tempId == id && _sf.nowBGMList.indexOf(id) == -1){
                _sf.nowBGMList.push(tempId);
            }
        }
        _sf.save();
    };

    /**
     * 保存设置
     */
    this.save = function(){
        var info = {
            mv : musicVolume,
            sv : soundVolume,
            cg : _sf.nowCGList,
            bgm : _sf.nowBGMList,
            voice : voiceVolume,
            textSpeed : _sf.textSpeed,
            autoSpeed : _sf.autoSpeed
        };
        IRWFile.SaveKV(RV.NowProject.key + "_gameinfo",info);
    };
    /**
     * 读取设置
     */
    this.load = function(){
        var info = IRWFile.LoadKV(RV.NowProject.key + "_gameinfo");
        if(info != null){
            musicVolume = info.mv;
            soundVolume = info.sv;
            _sf.nowCGList = info.cg;
            _sf.nowBGMList = info.bgm;
            voiceVolume = info.voice;
            _sf.textSpeed = info.textSpeed;
            _sf.autoSpeed = info.autoSpeed;
        }
    };

    /**
     * 播放BGM
     * @param file 文件
     * @param volume 音量
     */
    this.playBGM = function(file,volume){
        _sf.nowBGMFile = file;
        _sf.nowBGMVolume = volume;
        if(_sf.nowBGMFile.length > 0){
            IAudio.playBGM(file , parseInt(volume * (musicVolume / 100)));
        }
    };

    /**
     * 播放BGS
     * @param file 文件
     * @param volume 音量
     */
    this.playBGS = function(file,volume){
        _sf.nowBGSFile = file;
        _sf.nowBGSVolume = volume;
        if(_sf.nowBGSFile.length > 0){
            IAudio.playBGS(file , parseInt(volume * (musicVolume / 100)));
        }
    };
    /**
     * 播放SE
     * @param file 文件
     * @param volume 音量
     */
    this.playSE = function(file,volume){
        IAudio.playSE(file,volume * (soundVolume / 100));
    };
    /**
     * 播放Voice
     * @param file 文件
     * @param volume 音量
     */
    this.playVoice = function(file,volume){
        IAudio.playVoice(file , parseInt(volume * (voiceVolume / 100)));
    };

    /**
     * 设置BGM音量
     * @param volume
     */
    this.setBGMVolume = function(volume){
        if(_sf.nowBGMFile.length > 0){
            IAudio.playBGM(_sf.nowBGMFile , parseInt(volume));
        }
    };

    /**
     * 设置BGS音量
     * @param volume
     */
    this.setBGSVolume = function(volume){
        if(_sf.nowBGSFile.length > 0){
            IAudio.playBGS(_sf.nowBGSFile , parseInt(volume));
        }
    };

    this.playTitleMusic = function(){
        if(RV.NowSet.setAll.titleMusic.file.length < 0) return;
        _sf.playBGM("Audio/" + RV.NowSet.setAll.titleMusic.file , RV.NowSet.setAll.titleMusic.volume);
    };
    //播放确认音效
    this.playEnterSE = function(){
        if(RV.NowSet.setAll.enterSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.enterSound.file , RV.NowSet.setAll.enterSound.volume);
    };

    //播放取消音效
    this.playCancelSE = function(){
        if(RV.NowSet.setAll.cancelSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.cancelSound.file , RV.NowSet.setAll.cancelSound.volume);
    };

    //播放选择音效
    this.playSelectSE = function(){
        if(RV.NowSet.setAll.selectSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.selectSound.file , RV.NowSet.setAll.selectSound.volume);
    };



}/**
 * Created by 七夕小雨 on 2019/4/25.
 * iFActionGameStart
 * 游戏程序脚本入口
 */
function iFActionGameStart(){
    //设置DEBUG模式
    IVal.DEBUG = false;
    //设置默认文字颜色
    IVal.FontColor = IColor.White();
    //设置默认文字大小
    IVal.FontSize = 18;
    //设置首个Scene
    IVal.scene = new SStart();
}/**
 * Created by 七夕小雨 on 2018/7/3.
 * 解释器基础结构
 */
function IEventBase(){
    //初始化
    this.init = function(){
        return false
    };
    //循环
    this.update = function(){
        return false
    };
    //结束
    this.finish = function(){
        return true
    };
    //检测是否结束
    this.isFinish = function(){
        return this.finish()
    }
}

//静态事件队列
function IM(){}/**
 * Created by 七夕小雨 on 2018/2/26.
 * 触发器转译
 */
function IList(){
    //制作执行器
    this.MakeEvent = function( e, m) {
        if(e == null) return null;
        switch (e.code) {
            case 110://显示对话
                return new IM.Message(e,m);
            case 103://显示选项
                return new IM.TextChoice(e,m);
            case 104://显示提示
                return new IM.Tips(e,m);
            case 105://显示选择框
                return new IM.MessageBox(e,m);
            case 107://关闭文本
                return new IM.CloseMessage(e,m);
            case 113://高级文本分歧
                return new IM.TextChoiceEX(e,m);
            case 201: //等待
                return new IM.Wait(e,m);
            case 202: //变量
                return new IM.Value(e,m);
            case 203: //条件分歧
                return new IM.IF(e,m);
            case 204: //循环
                return new IM.Loop(e,m);
            case 2041://以上反复
                return new IM.LoopUp(e,m);
            case 205://跳出循环
                return new IM.LoopBreak(e,m);
            case 206://执行公共触发器
                return new IM.Event(e,m);
            case 220://获得CG鉴赏
                return new IM.GetCG(e,m);
            case 221://获得BGM鉴赏
                return new IM.GetBGM(e,m);
            case 222://跳转剧情
                return new IM.StoryMove(e,m);
            case 223://返回标题
                return new IM.BackTitle(e,m);
            case 301://画面闪烁
                return new IM.Flash(e,m);
            case 302 ://画面震动
                return new IM.Shack(e,m);
            case 303: //画面遮罩进入
                return new IM.MaskIn(e,m);
            case 304://画面遮罩淡出
                return new IM.MakeOut(e,m);
            case 305://天气
                return new IM.Weather(e,m);
            case 306://图片显示
                return new IM.PicShow(e,m);
            case 307://图片移动
                return new IM.PicMove(e,m);
            case 308://图片删除
                return new IM.PicDel(e,m);
            case 309://移动摄像机
                return new IM.ViewMove(e,m);
            case 310://摄像机复位
                return new IM.ViewReset(e,m);
            case 312://停止动画
                return new IM.StopAnim(e,m);
            case 313://对话框震动
                return new IM.ShackMessageBox(e,m);
            case 314://显示动画
                return new IM.ShowAnim(e,m);
            case 501: //播放背景音乐
                return new IM.BGMPlay(e,m);
            case 502: //播放背景音效
                return new IM.BGSPlay(e,m);
            case 503: //播放音效
                return new IM.SEPlay(e,m);
            case 504: //淡出背景音乐
                return new IM.BGMFade(e,m);
            case 505: //淡出背景音效
                return new IM.BGSFade(e,m);
            case 506: //停止音效
                return new IM.SEStop(e,m);
            case 507: //播放语音
                return new IM.VoicePlay(e,m);
            case 508: //停止语音
                return new IM.VoiceStop(e,m);
            case 604://保存游戏
                return new IM.SaveGame(e,m);
            case 605://读取游戏
                return new IM.LoadGame(e,m);
            case 606://执行脚本
                return new IM.Script(e,m);
            case 609://呼叫自定义UI
                return new IM.callSelfUI(e,m);
            case 701://移动UI
                return new IM.UIMove(e,m);
            case 702://消除UI
                return new IM.UIDisposeCtrl(e,m);
            case 703://消除全部
                return new IM.UIDisposeAll(e,m);
            case 704://更改选项
                return new IM.UICheckIndex(e,m);
            case 705://更改图片
                return new IM.UIPic(e,m);
            case 706://更改自动图片尺寸
                return new IM.UIAutoPicSize(e,m);
            case 707://更改文字
                return new IM.UITextChange(e,m);
            case 708://更改筛选条件
                return new IM.UIChangeIF(e,m);
            case 709:
                return new IM.UICloseUI(e,m);
            case 710:
                return new IM.UIAngel(e,m);
            case -32286: //mod扩展事件
                if(IVal.Mods != null){
                    //取出第一个参数作为Key值
                    var key = e.args[0].split('Φ');
                    var mod = IVal.Mods.findMod(key[0]);
                    if(mod.trigger.hasOwnProperty(key[1])){
                        return eval("new " + mod.trigger[key[1]] + "(e,m)");
                    }

                }else{
                    return null;
                }
            default:
                return null;
        }
    }
}/**
 * Created by 七夕小雨 on 2019/3/17.
 */
IM.Message = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    RV.NowCanvas.message.waitEnd = 0;
    this.init = function(){
        RV.NowCanvas.message.setThis(event.args[5] == "1" , event.args[3],event.args[4]);
        if(event.args.length >= 15){
            RV.NowCanvas.message.setFace(event.args[8],event.args[9],event.args[10]);
            var spaceH = event.args[6] == "-1" ? RV.NowSet.setMessage.spacingH : parseFloat(event.args[6]) / 100;
            var spaceV = event.args[7] == "-1" ? RV.NowSet.setMessage.spacingV : parseFloat(event.args[7]) / 100;
            RV.NowCanvas.message.setOther(spaceH,spaceV,
                parseInt(event.args[11]), parseInt(event.args[12]),parseInt(event.args[13]),parseInt(event.args[14]));
        }

        RV.NowCanvas.message.talk(event.args[0],event.args[1],event.args[2]);

        return false;
    };

    this.update = function(){
        if(RF.IsNext() && !RV.NowCanvas.message.isShowing()){
            RV.NowCanvas.message.waitEnd += 1;
        }

    };


    this.isFinish = function(){
        if(RV.NowCanvas.message.isClick) return false;
        if(RV.NowCanvas.message.isNext || (!RV.NowCanvas.message.isShowing() && RV.NowCanvas.message.waitEnd > 0)){
            return true;
        }
        return false;
    };
    this.finish = function(){
        var name = RF.TextAnalysisNull(event.args[0]);
        var msg = RF.TextAnalysisNull(RF.MakerValueText(event.args[1]));
        if(msg != ""){
            var logText = {
                name : name,
                msg : msg
            };
            RV.GameData.setMsgLog(logText);
        }
    }

};

IM.TextChoice = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.choice.setupChoice(event.args , 1000);
        return false;
    };

    this.finish = function(){
        var index = RV.NowCanvas.choice.index;
        var tempChoice = {
            name : "",
            msg : "➤ "+ RF.TextAnalysisNull(event.args[index])
        };
        RV.GameData.setMsgLog(tempChoice);
        if(main == RV.InterpreterMain) main.storySelectInfo.push(index);
        main.insertEvent(event.events[index].events);
    };

    this.isFinish = function(){
        return !RV.NowCanvas.choice.isW;
    };
};

IM.TextChoiceEX = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.choice.setupChoiceEx(event);
        if(event.args[0] == "1"){
            RV.NowCanvas.choice.timeEnd = function(){
                RV.NowCanvas.choice.index = parseInt(event.args[5]) - 1;
            };
        }
        return false;
    };

    this.finish = function(){
        var index = RV.NowCanvas.choice.index;
        var tempChoice = {
            name : "",
            msg : "➤ "+ RF.TextAnalysisNull(event.args[index])
        };
        RV.GameData.setMsgLog(tempChoice);
        if(main == RV.InterpreterMain) main.storySelectInfo.push(index);
        main.insertEvent(event.events[index].events);
    };

    this.isFinish = function(){
        return !RV.NowCanvas.choice.isW;
    };
};

IM.Tips = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RF.ShowTips(event.args[0]);
        return false;
    };
};

IM.MessageBox = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var index = -1;

    this.init = function(){
        var msg = RF.MakerValueText(event.args[0]);
        var endMsg = msg.replaceAll("\\\\","\\\\") + "||" + event.args[1] + "||" + event.args[2];
        var ui =  RV.NowUI.uis[5];
        var sui = null;
        if(main.ui == null){
            if(ui != null && IVal.scene instanceof  SMain){
                sui = IVal.scene.initSelfUI(ui,"\"" + endMsg + "\"");
            }
        }else{
            sui = main.ui.showChildfUI(ui,"\"" + endMsg + "\"");
        }
        if(sui != null){
            var oldEnd = sui.endDo;
            sui.endDo = function(e){
                index = e;
                oldEnd();
            }
        }else{
            index = 1;
        }
        return false;
    };

    this.finish = function(){
        if(event.events.length - 1 >= index){
            if(main == RV.InterpreterMain) main.storySelectInfo.push(index);
            main.insertEvent(event.events[index].events);
        }
    };

    this.isFinish = function(){
        return index >= 0;
    };
};

IM.CloseMessage = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RV.NowCanvas.message.re();
        return false;
    };
};

/**
 * Created by 七夕小雨 on 2019/3/18.
 */
IM.Wait = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;

    this.init = function(){
        wait = parseInt(event.args[0]);
        if(wait >= 30){
            RV.NowCanvas.message.re();
        }
        return false;
    };

    this.update = function(){
        wait -= 1
    };

    this.isFinish = function(){
        return wait <= 0
    };

};


IM.Value = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index1 = parseInt(event.args[0]);
        var val = RV.GameData.value[index1];
        var val2 = null;
        if(val != null){
            if(val === true || val === false){
                if(event.args[1] == "0"){
                    RV.GameData.value[index1] = event.args[2] == "1";
                }else if(event.args[1] == "1"){
                    val2 = RV.GameData.value[parseInt(event.args[2])];
                    if(val2 != null){
                        RV.GameData.value[index1] = val2;
                    }
                }else if(event.args[1] == "2"){
                    val2 = RV.GameData.value[parseInt(event.args[2])];
                    if(val2 != null){
                        RV.GameData.value[index1] = !val2;
                    }
                }
            }else if(typeof(val)=='string'){
                RV.GameData.value[index1] = event.args[1];
            }else if(!isNaN(val)){
                if(event.args[2] == "0"){
                    val2 = parseInt(event.args[3]);
                }else if(event.args[2] == "1"){
                    val2 = RV.GameData.value[parseInt(event.args[3])];
                }else if(event.args[2] == "2"){
                    val2 = rand(parseInt(event.args[3]),parseInt(event.args[4]))
                }else if(event.args[2] == "3"){
                    val2 = makeGameDataText(parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[5]));
                }
                RV.GameData.value[index1] = Calculation(parseInt(event.args[1]),RV.GameData.value[index1],val2);
            }
        }
        return false;
    };

    function makeGameDataText(type, s1, s2) {
        var val = 0;
        if (type == 0) {
            var bag = RV.GameData.findItem(0,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 1) {
            bag = RV.GameData.findItem(1,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 2) {
            bag = RV.GameData.findItem(2,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 3) {
            if(s1 == 0){
                return RV.GameData.actor.getMaxHP();
            }else if(s1 == 1){
                return RV.GameData.actor.getMaxMp();
            }else if(s1 == 2){
                return RV.GameData.actor.hp;
            }else if(s1 == 3){
                return RV.GameData.actor.mp;
            }else if(s1 == 4){
                return RV.GameData.actor.getWAtk();
            }else if(s1 == 5){
                return RV.GameData.actor.getWDef();
            }else if(s1 == 6){
                return RV.GameData.actor.getMAtk();
            }else if(s1 == 7){
                return RV.GameData.actor.getMDef();
            }else if(s1 == 8){
                return RV.GameData.actor.getSpeed();
            }else if(s1 == 9){
                return RV.GameData.actor.getLuck();
            }else if(s1 == 10){
                return RV.GameData.actor.level;
            }
        } else if (type == 4) {
            var rect = null;
            var et = null ;
            if (s1 == -10) {
                et = RV.NowMap.getActor();
                rect = RV.NowMap.getActor().getCharacter().getCharactersRect();
            } else if (s1 == -20) {
                et = RV.NowMap.findEvent(main.NowEventId);
                if(et != null){
                    rect = et.getRect();
                }

            } else {
                et = RV.NowMap.findEvent(s1);
                if(et != null){
                    rect = et.getRect();
                }
            }
            if (s2 == 0) {
                if(rect != null){
                    return parseInt(rect.centerX / RV.NowProject.blockSize);
                }

            } else if (s2 == 1) {
                if(rect != null){
                    return parseInt((rect.bottom - RV.NowProject.blockSize) / RV.NowProject.blockSize);
                }
            } else if (s2 == 2) {
                if(et != null){
                    return et.getDir();
                }
            }
        } else if (type == 5) {
            if (s1 == 0) {
                return RV.NowMap.getData().id;
            } else if (s1 == 1) {
                return RV.GameData.money;
            } else if (s1 == 2) {
                return IInput.x;
            } else if (s1 == 3) {
                return IInput.y;
            }
        }else if(type == 6){
            rect = null;
            et = RV.NowMap.findEnemy(s1);
            if(et != null){
                rect = et.getRect();
            }
            if (s2 == 0) {
                if(rect != null){
                    return parseInt(rect.centerX / RV.NowProject.blockSize);
                }

            } else if (s2 == 1) {
                if(rect != null){
                    return parseInt((rect.bottom - RV.NowProject.blockSize) / RV.NowProject.blockSize);
                }
            } else if (s2 == 2) {
                if(et != null){
                    return et.getDir();
                }
            }
        }
        return val;
    }


    function Calculation(fuc,val1,val2){
        if(fuc == 0) return val2;
        if(fuc == 1) return val1 + val2;
        if(fuc == 2) return val1 - val2;
        if(fuc == 3) return val1 * val2;
        if(fuc == 4) return parseInt(val1 / val2);
        if(fuc == 5) return val1 % val2;
    }

};


IM.IF = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    var id =  main.NowEventId;
    //var et = RV.NowMap.findEvent(id);

    this.init = function(){
        var dif = event2DIF();

        if(dif.result()){
            if(main == RV.InterpreterMain) main.storySelectInfo.push(1);
            main.insertEvent(event.events[0].events);
        }else if(dif.haveElse){
            if(main == RV.InterpreterMain) main.storySelectInfo.push(2);
            main.insertEvent(event.events[1].events);
        }else{
            if(main == RV.InterpreterMain) main.storySelectInfo.push(-1);
        }
        return false;
    };

    function event2DIF(){
        var evt = event;
        if (evt.code != 203) return null;
        var dif = new DIf();
        //dif.tag = et;
        dif.type = parseInt(evt.args[0]);
        dif.haveElse = evt.args[1] == "1";
        for (var i = 2; i < evt.args.length; i++) {
            var main = evt.args[i].split('Φ');
            var difi = new DIfItem();
            difi.type = parseInt(main[0]);
            difi.num1Index = parseInt(main[1]);
            difi.fuc = parseInt(main[2]);
            difi.type2 = parseInt(main[3]);
            difi.num2 = main[4];
            difi.num2Index =parseInt(main[5]);
            dif.items.push(difi);
        }
        return dif;
    }

};


IM.Loop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        var newEvents = [];
        for(var i = 0;i<event.events.length;i++){
            newEvents.push(event.events[i]);
        }
        var et = new DEvent();
        et.code = 2041;
        newEvents.push(et);
        main.insertEvent(newEvents);
        return false;
    };

};

IM.LoopUp = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        for(var i = main.pos;i >= 0;i--){
            if(main.event_list[i].code == 204){
                main.pos = i;
                break;
            }else{
                main.event_list.splice(i,1);
            }
        }
        main.pos -= 1;
        return false;
    };

};

IM.LoopBreak = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index = -1;
        for(var i = main.pos;i < main.event_list.length;i++){
            if(main.event_list[i].code == 2041){
                index = i;
                break;
            }
        }
        for(i = index ;i >= 0;i--){
            if(main.event_list[i].code == 204){
                main.pos = i;
                break;
            }else{
                main.event_list.splice(i,1);
            }
        }
        return false;
    };

};

IM.Event = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var trigger = RV.NowSet.findEventId(parseInt(event.args[0]));
        main.insertEvent(trigger.events);

    }
};

IM.StoryMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = false;

    this.init = function(){
        if(RV.GameData.playCGIndex != -1) RV.GameData.jumpTime += 1;
        var mapId = 0;
        if(event.args[0] == "0"){
            mapId = parseInt(event.args[1]);
        }else if(event.args[0] == "1"){
            mapId =  RV.GameData.getValue(parseInt(event.args[1]),0);
        }
        var story = RV.NowProject.findMap(mapId);
        RV.GameData.storyId = mapId;
        RV.InterpreterMain.endInterpreter();
        RV.InterpreterMain.addEvents(story.events);

        if(RV.GameData.playCGIndex != -1){
            if(RV.GameData.jumpTime >= RV.GameData.currentCG.autoTimes){
                RV.GameData.jumpTime = 0;
                IVal.scene.dispose();
                IVal.scene = new STitle();
            }
        }else{
            RV.NowCanvas.clear();
            RF.SaveGame();
        }

    };


};

IM.GetCG = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.addCG(parseInt(event.args[0]));
        return true;
    }
};

IM.GetBGM = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.addBGM(parseInt(event.args[0]));
        return true;
    }

};
IM.BackTitle = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameData.menu = 0;
        IVal.scene.dispose();
        IAudio.BGMFade(2);
        IAudio.BGSFade(2);
        IVal.scene = new STitle();
        return true;
    }

};/**
 * Created by 七夕小雨 on 2019/3/19.
 */
IM.Flash = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var color = new IColor(parseInt(event.args[2]),parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[1]));
        RV.NowCanvas.flash(color,parseInt(event.args[0]));
        return false;
    };

};


IM.Shack = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.startShack(parseInt(event.args[1]) , parseInt(event.args[2]) , parseInt(event.args[0]));
        return false;
    };

};

IM.ShackMessageBox = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.message.StartShack(parseInt(event.args[1]) , parseInt(event.args[2]) , parseInt(event.args[0]));
        return false;
    };

};

IM.MaskIn = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var color = new IColor(parseInt(event.args[2]),parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[1]));
        RV.NowCanvas.maskFadeIn(color,parseInt(event.args[0]));
        return false;
    }

};

IM.MakeOut = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.maskFadeOut(parseInt(event.args[0]));
        return false;
    }
};

IM.Weather = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.weather.setWeatherType(parseInt(event.args[0]));
        RV.GameData.canvasData.weatherIndex = parseInt(event.args[0]);
        return false;
    }
};

IM.PicShow = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            RV.NowCanvas.pics[id].dispose();
            RV.NowCanvas.pics[id] = null;
        }
        var path = "";
        if(event.args[1] == "0"){
            path = event.args[2];
        }else if(event.args[1] == "1"){
            path = RV.GameData.getValues(parseInt(event.args[2]));
        }
        var point = 0;
        if(event.args[3] == "1"){
            point = 0.5;
        }
        var x = 0;
        var y = 0;
        if(event.args[4] == "0"){
            x = parseInt(event.args[5]);
            y = parseInt(event.args[6]);
        }else{
            x = RV.GameData.getValueNum(parseInt(event.args[5]),0);
            y = RV.GameData.getValueNum(parseInt(event.args[6]),0);
        }
        var view = RV.NowCanvas.getView();
        var sp = new ISprite(RF.LoadBitmap("Picture/" + path),view);
        sp.path = path;
        sp.yx = point;
        sp.yy = point;
        sp.x = x;
        sp.y = y;
        sp.zoomX = parseInt(event.args[7]) / 100;
        sp.zoomY = parseInt(event.args[8]) / 100;
        sp.opacity = parseInt(event.args[9]) / 255;
        sp.angle = parseInt(event.args[10]);

        sp.mirror = event.args[11] == "1";

        sp.z = 10 + id;
        RV.NowCanvas.pics[id] = sp;
        return false;
    };
};

IM.PicMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            var w = parseInt(event.args[1]);
            if(event.args[2] == "1"){
                wait = w;
            }
        }
        var point = 0;
        if(event.args[3] == "1"){
            point = 0.5;
        }
        var x = 0;
        var y = 0;
        if(event.args[4] == "0"){
            x = parseInt(event.args[5]);
            y = parseInt(event.args[6]);
        }else{
            x = RV.GameData.getValueNum(parseInt(event.args[5]),0);
            y = RV.GameData.getValueNum(parseInt(event.args[6]),0);
        }
        var sp = RV.NowCanvas.pics[id];
        if(sp == null) return false;
        sp.yx = point;
        sp.yy = point;
        sp.slideTo(x,y,w);
        sp.scaleTo(parseInt(event.args[7]) / 100 , parseInt(event.args[8]) / 100,w);
        sp.fadeTo(parseInt(event.args[9]) / 255,w);
        sp.rotateTo(parseInt(event.args[10]),w);
        sp.mirror = event.args[11] == "1";

        return false;
    };

    this.update = function(){
        wait -= 1
    };

    this.isFinish = function(){
        return wait <= 0
    };
};

IM.PicDel = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            RV.NowCanvas.pics[id].dispose();
            delete RV.NowCanvas.pics[id];
        }
        return false;
    };
};

IM.ShowAnim = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var oldX = parseInt(event.args[2]) - 5;
        var oldY = parseInt(event.args[3]) - 5;
        var rect = new IRect(oldX , oldY , oldX + 10, oldY + 10);
        var am = RV.NowCanvas.playAnim(event.args[1],null,null,event.args[4] == "0",rect,event.args[0]);
        if(am != null){
            am.resId = event.args[1];
            am.single = event.args[4] == "0";
            am.id = event.args[0];
            am.oldX = oldX;
            am.oldY = oldY;
        }
        return false;
    };
};

IM.StopAnim = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var am = RV.NowCanvas.findAnim(event.args[0]);
        if(am != null){
            am.dispose();
            RV.NowCanvas.anim.remove(am);
        }
    }

};



IM.ViewMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;

    this.init = function(){
        var view = RV.NowCanvas.getView();
        var x = parseInt(event.args[0]) * -1;
        var y = parseInt(event.args[1]) * -1;
        view.shifting(view.ox,view.oy,view.ox + x , view.oy + y,parseInt(event.args[2]));

        if(event.args[3].length > 3){
            var w = parseInt(event.args[2]);
            if(event.args[3] == "1"){
                wait = w;
            }
        }

        return false;
    };

    this.update = function(){
        wait -= 1
    };

    this.isFinish = function(){
        return wait <= 0
    };
};

IM.ViewReset = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var view = RV.NowCanvas.getView();
        view.ox = 0;
        view.oy = 0;
        return false;
    };
};
/**
 * Created by 七夕小雨 on 2019/3/19.
 */
IM.BGMPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playBGM("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};


IM.BGSPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playBGS("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};

IM.SEPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playSE("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};

IM.VoicePlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playVoice("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};

IM.BGMFade = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.nowBGMFile = "";
        IAudio.BGMFade(parseInt(event.args[0]));
        return false;
    };
};

IM.BGSFade = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.nowBGSFile = "";
        IAudio.BGSFade(parseInt(event.args[0]));
        return false;
    };
};

IM.SEStop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        IAudio.stopSE();
        return false;
    };
};
IM.VoiceStop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        IAudio.stopVoice();
        return false;
    };
};
/**
 * Created by 七夕小雨 on 2019/3/19.
 */
IM.SaveGame = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RF.SaveGame();
        return false;
    };
};

IM.LoadGame = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.isLoad = true;

        return false;
    };
};


IM.Script = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var _sf = null;
        var obj = null;
        if(main.ctrl != null){
            _sf = main.ctrl;
            obj = main.ctrl.obj;
        }
        if(main.ctrl == null && main.ui != null){
            _sf = main.ui;
        }
        eval(event.args[0]);
        return false;
    };
};

IM.callSelfUI = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        if(RV.NowCanvas != null)RV.NowCanvas.message.waitEnd = 0;
        if(main.ui == null){
            var ui =  RV.NowUI.uis[event.args[0]];
            if(ui != null && IVal.scene instanceof  SMain){
                IVal.scene.initSelfUI(ui,event.args[1]);
            }
        }else{
            ui =  RV.NowUI.uis[event.args[0]];
            main.ui.showChildfUI(ui,event.args[1]);
        }
        if(RV.NowCanvas != null)RV.NowCanvas.message.fadeOut();
        return true;
    };

};

/**
 * Created by 七夕小雨 on 2018/6/25.
 * 事件解释器
 */
function IMain(){
    //当前解释的事件
    var event_now = null;
    //事件队列（数据）
    this.event_list = [];
    //事件位置指针
    this.pos = -1;
    //事件队列是否处理完毕
    this.isEnd = false;
    //堆栈
    this.indentStack = [];
    //子事件处理
    this.subStory = null;

    var _sf = this;
    //执行触发器的场景
    this.scene = null;
    //触发器的tag
    this.tag = null;
    //执行触发器的当前ID
    this.NowEventId = -1;
    //剧情部分保存的数据
    this.storySelectInfo = [];
    this.iIndex = -1;
    this.ievent = -1;

    /**
     * 向当前解释位置插入事件
     * @param events 事件集合
     */
    this.insertEvent = function(events){
        for(var i = events.length - 1;i>=0;i--){
            this.event_list.splice(this.pos + 1,0,events[i]);
        }
        this.isEnd = false;
    };

    /**
     * 向事件解释器末尾增加事件
     * @param events 事件集合
     */
    this.addEvents = function(events){
        if(events.length <= 0) return;
        if(this.event_list.length == 0){
            this.pos = -1;
        }
        this.event_list = this.event_list.concat(events);
        this.isEnd = false;
    };

    /**
     * 事件解释器强制结束
     */
    this.endInterpreter = function(){
        this.storySelectInfo = [];
        this.iIndex = -1;
        this.ievent = -1;
        this.subStory = null;
        this.event_list.length = 0;
        event_now = null;
        this.pos = -1;
        this.isEnd = true;
    };
    /**
     * 事件解释器主循环
     * @returns {boolean}
     */
    this.update = function(){
        if(_sf.isEnd){
            return false;
        }
        if(_sf.subStory != null && _sf.subStory.isEnd){
            _sf.subStory = null;
        }
        if(_sf.subStory != null && !_sf.subStory.isEnd){
            _sf.subStory.update();
            return true;
        }
        while(true){
            if(event_now == null && _sf.isEnd){
                break;
            }
            if(event_now == null || event_now.isFinish()){
                if(event_now != null){
                    event_now.finish();
                }
                if(poaAdd()){
                    break;
                }
            }
            if(event_now != null && ! event_now.isFinish()){
                event_now.update();
                break;
            }
        }
        return true;
    };

    this.load = function(storySelectInfo,index,evet){
        var info = JSON.parse(JSON.stringify(storySelectInfo));
        while(true){
            var out = posMin(info,index,evet)
            if(out){
                break;
            }
        }
    };

    function posMin(storySelectInfo,index,evet){
        _sf.pos += 1;
        //没有兼容存档的情况，回到剧情的第一项
        if(_sf.pos >= _sf.event_list.length){
            storySelectInfo.length = 0;
            _sf.pos = -1;
            return true;
        }
        if(storySelectInfo.length == 0 && index == -1){
            _sf.pos -= 1;
            return true;
        }
        if(storySelectInfo.length == 0 && index == _sf.pos && evet == _sf.event_list[_sf.pos].code){
            _sf.pos -= 1;
            return true;
        }
        makerEventMin(_sf.event_list[_sf.pos] , storySelectInfo);
        return false;
    }

    function makerEventMin(e,info){
        var ee = new IListMin();
        event_now = ee.MakeEvent(e,_sf,info);
        return event_now == null ? false : event_now.init();
    }

    function equalsEvent(e1,e2){
        //严格存档判定，可能不兼容旧存档，故而放弃
        //if(e1.code == e2.code){
        //    var equals = true;
        //    for(var i = 0;i<e1.args.length;i++){
        //        if(e1.args[i] != e2.args[i]){
        //            equals = false;
        //            break;
        //        }
        //    }
        //    return equals;
        //}
        //return false;
        return e1.code == e2.code;
    }

    /**
     * 事件索引指针推进
     * @returns {boolean}
     */
    function poaAdd(){
        _sf.pos += 1;
        if(_sf.pos >= _sf.event_list.length){
            _sf.isEnd = true;
            _sf.event_list = [];
            event_now = null;
            return false;
        }
        if(_sf === RV.InterpreterMain) _sf.iIndex = _sf.pos;
        if(_sf === RV.InterpreterMain) _sf.ievent = _sf.event_list[_sf.pos].code;
        if(makerEvent(_sf.event_list[_sf.pos])){
            return true;
        }
    }

    /**
     * 数据转译
     * @param e 事件数据
     * @returns {boolean}
     */
    function makerEvent(e){
        var ee = new IList();
        event_now = ee.MakeEvent(e,_sf);
        return event_now == null ? false : event_now.init();
    }

    /**
     * 跳转至指定事件位置
     * @param index
     */
    this.jumpToIndex = function(index){
        _sf.pos = index - 1;
        if(_sf.pos >= _sf.event_list.length){
            _sf.isEnd = true;
            event_now = null;
        }
    };
    /**
     * 条件分歧
     * @param FIndex 条件结束的事件位置
     * @constructor
     */
    this.IFInfo = function(FIndex){
        this.FinishJumpIndex = FIndex;
    };
    /**
     * 循环
     * @param l 循环起点位置
     * @param b 循环终点位置
     * @constructor
     */
    this.LoopInfo = function(l,b){
        this.LoopIndex = l;
        this.BreakIndex = b;
    };

    /**
     * 选项
     * @param Cindex 选项位置
     * @param FIndex 终点位置
     * @constructor
     */
    this.BranchInfo = function(Cindex,FIndex){
        this.ChoiceJumpIndex = Cindex;
        this.FinishJumpIndex = FIndex;

        this.GetJumpIndex = function(selectIndex){
            return this.ChoiceJumpIndex[selectIndex];
        }
    };
    /**
     * 选项出栈
     * @returns {*}
     */
    this.AuxFetchBranchinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.BranchInfo) break;
        }
        _sf.endLogic = s;
        return s;
    };
    /**
     * 循环出栈
     * @returns {*}
     */
    this.AuxFetchLoopinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.LoopInfo) break;
        }
        _sf.endLogic = s;
        return s;
    };
    /**
     * 条件分歧出栈
     * @returns {*}
     */
    this.AuxFetchIfinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.IFInfo) break;
        }
        _sf.endLogic = s;
        return s;
    }


}

function IListMin(){
    //制作执行器
    this.MakeEvent = function( e, m,info) {
        if(e == null) return null;
        switch (e.code) {
            case 103:
                return new IM.TextChoiceMin(e,m,info);
            case 105:
                return new IM.MessageBoxMin(e,m,info);
            case 113:
                return new IM.TextChoiceMin(e,m,info);
            case 203:
                return new IM.IFMin(e,m,info);
            case 204:
                return new IM.Loop(e,m);
            case 2041:
                return new IM.LoopUp(e,m);
            case 205:
                return new IM.LoopBreak(e,m);
            case 206:
                return new IM.Event(e,m);
            default:
                return null;
        }
    }
}

IM.TextChoiceMin = function(event,main,info){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index = info[0];
        info.shift();
        main.insertEvent(event.events[index].events);
        return false;
    };

};

IM.MessageBoxMin = function(event,main,info){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index = info[0];
        info.shift();
        if(event.events.length - 1 >= index){
            main.insertEvent(event.events[index].events);
        }
        return false;
    };

};

IM.IFMin = function(event,main,info) {
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function () {
        var dif = info[0];
        info.shift();
        if (dif == 1) {
            main.insertEvent(event.events[0].events);
        } else if(dif == 2){
            main.insertEvent(event.events[1].events);
        }

        return false;
    };
};/**
 * Created by 七夕小雨 on 2019/4/8.
 * 关键帧动画逻辑执行类
 * @param res 动画资源
 * @param view 要演示动画的视窗
 * @param isSingle 动画是否只播放一次
 * @param actor 动画相对的actor
 * @param rect 动画相对的矩形
 */
function LAnim(res,view,isSingle,actor,rect,id){
    var _sf = this;
    //==================================== 公有属性 ===================================
    //动画播放完毕回调
    this.endDo = null;
    //动画tag
    this.tag   = null;
    //是否按actor位置进行坐标修正
    this.pointActor = false;
    //相对判断矩形
    this.userRect = rect;
    //==================================== 私有属性属性 ===================================
    //动画资源数据
    var data = res;

    //动画执行
    var animation = null;
    //动画图片
    var cofBitmap = null;
    //动画精灵
    var sprite = null;
    //动画播放间隔
    var animationWait = 0;
    var animationIndex = -1;
    //动画是否执行完毕
    var end = false;
    //动画行为
    var doList = [];

    if(data.anims != null && data.anims.length > 0){
        animation = data.anims[0];
        cofBitmap = new IBCof(RF.LoadCache("Animation/" + data.file),animation.x , animation.y , animation.width , animation.height);
        sprite = new ISprite(cofBitmap , data.point.type === 1 || (data.point.dir === 5) ? null : view);
        sprite.yx = 0.5;
        sprite.yy = 0.5;
        sprite.z = 12 + id;
    }

    if(animation != null && animation.sound != "" && data.anims.length === 1){
        RV.GameSet.playSE("Audio/" + animation.sound,animation.volume);
    }

    Object.defineProperty(this, "x", {
        get: function () {
            if(sprite == null){
                return 0;
            }
            return sprite.x;
        },
        set: function (value) {
            if(sprite == null){
                return;
            }
            sprite.x = value;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            if(sprite == null){
                return 0;
            }
            return sprite.y;
        },
        set: function (value) {
            if(sprite == null){
                return;
            }
            sprite.y = value;
        }
    });

    /**
     * 主循环
     */
    this.update = function(){
        if(data.point.type === 0 && !this.pointActor){
            this.pointUpdate();
        }
        end = sprite == null || (!sprite.isAnim() && animationIndex >=  data.anims.length - 1);
        if(end && isSingle && this.endDo != null){
            this.endDo();
            this.endDo = null;
        }
        if(data.anims.length > 1){
            if(animationWait <= 0){
                animationIndex += 1;
                if(animationIndex >=  data.anims.length){
                    if(!isSingle || sprite.isAnim()){
                        animationIndex = 0;
                    }else{
                        return;
                    }
                }
                var tempR = data.anims[animationIndex];
                cofBitmap.x = tempR.x;
                cofBitmap.y = tempR.y;
                cofBitmap.width = tempR.width;
                cofBitmap.height = tempR.height;
                animationWait = tempR.time;

                if(tempR.sound != "" && data.anims.length > 1){
                    RV.GameSet.playSE("Audio/" + tempR.sound,tempR.volume);
                }

                for(var i = 0;i<data.actionList.length;i++){
                    if(doList.indexOf(animationIndex + 1) < 0 && data.actionList[i].index === animationIndex + 1){
                        var action = data.actionList[i];
                        if(action.isOpactiy){
                            sprite.fadeTo(action.opacity / 255,action.opacityTime);
                        }
                        if(action.isZoom){
                            sprite.scaleTo(action.zoomX / 100,action.zoomY / 100,action.zoomTime);
                        }
                        if(action.isFlash){
                            RV.NowCanvas.flash(new IColor(action.color[0],action.color[1],action.color[2],action.color[3]),action.flashTime);
                        }
                        if(action.isActorFlash){
                            if(actor != null){
                                var sp = null;
                                if(actor instanceof  LTrigger){
                                    sp = actor.getCharacter().getCharacter().getSpirte();
                                }else if(actor instanceof LActor){
                                    sp = actor.getCharacter().getSpirte();
                                }else if(actor instanceof LEnemy){
                                    sp = actor.getCharacter().getSpirte();
                                }else if(actor instanceof LInteractionBlock){
                                    sp = actor.getSprite();
                                }
                                if(sp != null){
                                    sp.flash(new IColor(action.actorColor[0],action.actorColor[1],action.actorColor[2],action.actorColor[3]),action.actorFlashTime);
                                }

                            }
                        }
                        if(isSingle){
                            doList.push(animationIndex + 1);
                        }

                    }

                }

            }else{
                animationWait -= 1;
            }
        }
    };
    /**
     * 刷新动画位置
     */
    this.pointUpdate = function() {
        var x = 0;
        var y = 0;
        var haveView = true;
        var point = data.point;
        if(point.type === 0){//相对坐标
            var rect = new IRect(1,1,1,1);
            if(actor != null){
                rect = actor.getUserRect();
            }else if(_sf.userRect != null){
                rect = _sf.userRect;
            }
            if(data.anims.length > 0){
                var animation = data.anims[0];
                if(point.dir === 0){//中心
                    x = rect.x + (rect.width) / 2;
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 1){//上
                    x = rect.x + (rect.width) / 2;
                    y = rect.y + (animation.height * sprite.zoomY);
                }else if(point.dir === 2){//下
                    x = rect.x + rect.width / 2;
                    y = rect.bottom - (animation.height * sprite.zoomY);
                }else if(point.dir === 3){//左
                    x = rect.x + (animation.width * sprite.zoomX);
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 4){//右
                    x = rect.right - (animation.width * sprite.zoomX);
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 5){//画面
                    haveView = false;
                    x = RV.NowProject.gameWidth / 2;
                    y = RV.NowProject.gameHeight / 2;
                }
                if(animationIndex >= 0 && animationIndex < data.anims.length){
                    x += data.anims[animationIndex].dx;
                    y += data.anims[animationIndex].dy;
                }else if(animationIndex == -1 && data.anims.length > 0){
                    x += data.anims[0].dx;
                    y += data.anims[0].dy;
                }

            }
        }else{//绝对坐标
            haveView = false;
            x = point.x;
            y = point.y;
        }
        sprite.x = x;
        sprite.y = y;
    };

    this.pointUpdate();
    /**
     * 释放
     */
    this.dispose = function(){
        if(sprite == null) return;
        sprite.disposeMin();
    };
    /**
     * 获得动画精灵对象
     * @returns {*}
     */
    this.getSprite = function(){
        return sprite;
    };

    /**
     * 获得精灵矩形
     * @returns {*}
     */
    this.getRect = function(){
        return sprite.GetRect();
    };

    this.fadeTo = function(o,time){
        sprite.fadeTo(o,time);
    }

}/**
 * Created by 七夕小雨 on 2021/3/26.
 */
function LAutoPic(bmp,width,height,x1,x2,y1,y2,view){
    var x = 0;
    var y = 0;
    var z = 0;
    var w = width;
    var h = height;

    var visible = true;
    var opacity = 1;

    var bitmap = bmp;
    var cofs = [];

    var rect = new IRect(0,0,1,1);

    var slideFrames = 0;
    var endX = 0;
    var endY = 0;
    var diffX = 0;
    var diffY = 0;
    var tmpX = 0;
    var tmpY = 0;

    var _sf = this;
    var sps = [];

    if(bitmap.complete){
        initPic();
    }else{
        if(bitmap.onload == null){
            bitmap.onload = function(){
                initPic();
            }

        }else{
            var tempOnload = bitmap.onload;
            bitmap.onload = function(){
                tempOnload();
                initPic();
            }
        }
    }

    function initPic(){
        cofs[0] = new IBCof(bitmap,0,0,x1,y1);//左上
        cofs[1] = new IBCof(bitmap,x1,0, bitmap.width - (x1 + x2),y1);//上
        cofs[2] = new IBCof(bitmap,bitmap.width - x2,0, x2 , y1);//右上
        cofs[3] = new IBCof(bitmap,0,y1, x1 , bitmap.height - (y1 + y2));//左
        cofs[4] = new IBCof(bitmap,bitmap.width - x2,y1, x2 , bitmap.height - (y1 + y2));//右
        cofs[5] = new IBCof(bitmap,0,bitmap.height - y2, x1 , y2);//左下
        cofs[6] = new IBCof(bitmap,bitmap.width - x2,bitmap.height - y2, x2 , y2);//右下
        cofs[7] = new IBCof(bitmap,x1 , bitmap.height - y2 , bitmap.width - (x1 + x2),y2);//下
        cofs[8] = new IBCof(bitmap,x1 , y1 , bitmap.width - (x1 + x2) , bitmap.height - (y1 + y2));//中间

        for(var i = 0;i<9;i++){
            sps[i] = new ISprite(cofs[i],view);
        }
        _sf.x = x;
        _sf.y = y;
        _sf.width = w;
        _sf.height = h;
        _sf.visible = visible;
        _sf.z = z;
    }

    this.GetRect = function(){
        rect.left = _sf.x;
        rect.top = _sf.y;
        rect.right = _sf.x + _sf.width;
        rect.bottom = _sf.y + _sf.height;
        return rect;
    };

    Object.defineProperty(this, "x", {
        get: function () {
            return x;
        },
        set: function (value) {
            x = value;
            if(sps.length <= 0) return;
            sps[0].x = x;
            sps[1].x = x + cofs[0].width;
            sps[2].x = x + (w - cofs[2].width);
            sps[3].x = x;
            sps[4].x = x + (w - cofs[2].width);
            sps[5].x = x;
            sps[6].x = x + (w - cofs[2].width);
            sps[7].x = x + cofs[0].width;
            sps[8].x = x + cofs[0].width;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            return y;
        },
        set: function (value) {
            y = value;
            if(sps.length <= 0) return;
            sps[0].y = y;
            sps[1].y = y;
            sps[2].y = y;
            sps[3].y = y + cofs[0].height;
            sps[4].y = y + cofs[0].height;
            sps[5].y = y + (h - cofs[5].height);
            sps[6].y = y + (h - cofs[5].height);
            sps[7].y = y + (h - cofs[5].height);
            sps[8].y = y + cofs[0].height;
        }
    });

    Object.defineProperty(this, "z", {
        get: function () {
            return z;
        },
        set: function (value) {
            z = value;
            if(sps.length <= 0) return;
            for (var i = 0; i < sps.length; i++) {
                sps[i].z =  z;
            }

        }
    });

    Object.defineProperty(this, "width", {
        get: function () {
            return w;
        },
        set: function (value) {
            w = value;
            if(sps.length <= 0) return;
            var minw = w - (cofs[0].width + cofs[2].width);
            if(minw < 0) minw = 1;
            var zoom = minw / cofs[1].width ;
            sps[1].zoomX = zoom;
            sps[7].zoomX = zoom;
            sps[8].zoomX = zoom;
            _sf.x = x;
        }
    });

    Object.defineProperty(this, "height", {
        get: function () {
            return h;
        },
        set: function (value) {
            h = value;
            if(sps.length <= 0) return;
            var minh = h - (cofs[0].height + cofs[5].height);
            if(minh < 0)minh = 1;
            var zoom = minh / cofs[3].height ;
            sps[3].zoomY = zoom;
            sps[4].zoomY = zoom;
            sps[8].zoomY = zoom;
            _sf.y = y;
        }
    });

    Object.defineProperty(this, "visible", {
        get: function () {
            return visible;
        },
        set: function (value) {
            visible = value;
            if(sps.length <= 0) return;
            for (var i = 0; i < sps.length; i++) {
                sps[i].visible =  visible;
            }
        }
    });

    Object.defineProperty(this, "opacity", {
        get: function () {
            return opacity;
        },
        set: function (value) {
            opacity = value;
            if(sps.length <= 0) return;
            for (var i = 0; i < sps.length; i++) {
                sps[i].opacity =  opacity;
            }
        }
    });

    this.update = function(){
        updateSlide();
    };

    this.slideTo = function (eX, eY, frames) {
        this.slide(_sf.x,_sf.y,eX,eY,frames);
    };

    function updateSlide(){
        if(slideFrames <= 0) return;
        slideFrames -= 1;
        if(slideFrames <= 0){
            _sf.x = endX;
            _sf.y = endY;
        }else{
            tmpX += diffX;
            tmpY += diffY;
            _sf.x = tmpX;
            _sf.y = tmpY;
        }
    }

    this.slide = function(bX,bY,eX,eY,frames){
        if(frames <= 0){
            _sf.x = eX;
            _sf.y = eY;
        }else{
            slideFrames = frames;
            endX = eX;
            endY = eY;
            diffX = ((endX - bX) /  parseFloat(frames));
            diffY = (endY - bY) /  parseFloat(frames);
            tmpX = bX;
            tmpY = bY;
            _sf.x = bX;
            _sf.y = bY;
        }
    };


    this.pauseAnim = function(){
        for(var i = 0;i<sps.length;i++){
            sps[i].pauseAnim();
        }
    };

    this.addAction = function(action,args){
        for(var i = 0;i<sps.length;i++){
            sps[i].addAction.apply(sps[i],arguments);
        }
    };

    this.dispose = function(){
        for(var i = 0;i<sps.length;i++){
            sps[i].disposeMin();
        }
    }
}/**
 * Created by 七夕小雨 on 2019/3/18.
 * 画面元素承载场景
 */
function LCanvas(){

    var _sf = this;
    //场景静态化
    RV.NowCanvas = this;
    //文本框
    this.message = new LMessage();
    //选项框
    this.choice = new LChoice();
    //将对话框与文本框隐藏
    this.message.re();
    //天气
    this.weather = new LWeather();
    this.weather.init();
    //图片
    this.pics = {};
    //动画
    this.anim = [];
    //闪烁图片
    var flash = null;
    //遮罩图片
    var mask = null;
    //生成场景视窗
    var view = new IViewport(0 , 0 , RV.NowProject.gameWidth , RV.NowProject.gameHeight);
    view.z = 10;
    // 震动使用
    var ShakePower,ShakeSpeed,ShakeDuration,ShakeDirection,Shake;
    var oldVpX,oldVpY;
    var StartShake;
    //震动初始化
    shakeInit();
    /**
     * 主循环
     */
    this.update = function(){
        updateShack();
        updateViewport();
        for(var i = 0;i<this.anim.length;i++){
            this.anim[i].update();
        }
        this.message.updateDraw();
        this.weather.update();
        this.choice.update();
        return this.choice.isW;
    };

    this.isInit = function(){
        return this.message.getIsInit();
    };

    /**
     * 清理场景
     */
    this.clear = function(){
        _sf.message.re();
        for(var key in this.pics){
            this.pics[key].dispose();
            delete this.pics[key];
        }
        for(var i = 0;i<this.anim.length;i++){
            this.anim[i].dispose();
            this.anim[i] = null;
        }
        this.pics = {};
        this.anim = [];


    };
    /**
     * 保存场景
     */
    this.save = function(){
        RV.GameData.canvasData.pics = [];
        RV.GameData.canvasData.anims = [];
        //保存图片
        for(var key in this.pics) {
            var pic = this.pics[key];
            if(pic.path != null){
                var object = {
                    id : key,
                    path:pic.path,
                    x : pic.x,
                    y : pic.y,
                    z : pic.z,
                    yx : pic.yx,
                    yy : pic.yy,
                    zoomX : pic.zoomX,
                    zoomY : pic.zoomY,
                    angle : pic.angle,
                    mirror : pic.mirror,
                    opacity : pic.opacity
                };
                RV.GameData.canvasData.pics.push(object);
            }

        }
        //保存动画
        for(var i = 0;i<this.anim.length;i++){
            var anim = this.anim[i];
            if(anim.resId != null){
                object = {
                    resId : anim.resId,
                    single : anim.single,
                    id : anim.id,
                    oldX : anim.oldX,
                    oldY : anim.oldY
                };
                RV.GameData.canvasData.anims.push(object);
            }
        }

    };

    /**
     * 读取场景
     */
    this.load = function(){
        var picSet = RV.GameData.canvasData.pics;
        var animSet =  RV.GameData.canvasData.anims;
        //还原天气
        _sf.weather.setWeatherType(RV.GameData.canvasData.weatherIndex);
        //还原图片
        for(var i = 0;i<picSet.length;i++){
            var sp = new ISprite(RF.LoadBitmap("Picture/" + picSet[i].path),view);
            sp.path = picSet[i].path;
            sp.yx = picSet[i].yx;
            sp.yy = picSet[i].yy;
            sp.x = picSet[i].x;
            sp.y = picSet[i].y;
            sp.zoomX = picSet[i].zoomX;
            sp.zoomY = picSet[i].zoomY;
            sp.opacity = picSet[i].opacity;
            sp.angle = picSet[i].angle;
            sp.mirror = picSet[i].mirror;
            sp.z = picSet[i].z;
            RV.NowCanvas.pics[picSet[i].id] = sp;
        }
        //还原动画
        for(i = 0;i<animSet.length;i++){
            var oldX = animSet[i].oldX;
            var oldY = animSet[i].oldY;
            var rect = new IRect(oldX , oldY , oldX + 10, oldY + 10);
            var am = RV.NowCanvas.playAnim(animSet[i].resId,null,null,animSet[i].single,rect,animSet[i].id);
            if(am != null){
                am.resId = animSet[i].resId;
                am.single = animSet[i].single;
                am.id = animSet[i].id;
                am.oldX = animSet[i].oldX;
                am.oldY = animSet[i].oldY;
            }
        }

    };

    /**
     * 释放场景
     */
    this.dispose = function(){
        this.message.dispose();
        this.choice.dispose();
        this.weather.dispose();
        for(var key in this.pics){
            this.pics[key].dispose();
            delete this.pics[key];
        }
        for(var i = 0;i<this.anim.length;i++){
            this.anim[i].dispose();
            this.anim[i] = null;
        }
        this.pics = {};
        this.anim = [];

        if(flash != null) {
            flash.dispose();
            flash = null;
        }
        if(mask != null) {
            mask.dispose();
            mask = null;
        }
    };

    /**
     * 闪烁
     * @param color 闪烁颜色
     * @param time 时间
     */
    this.flash = function(color,time){
        if(flash != null) {
            flash.dispose();
            flash = null;
        }
        flash = new ISprite(RV.NowProject.gameWidth , RV.NowProject.gameHeight , color);
        flash.z = 999999;
        flash.fade(1.0,0,time);
    };

    /**
     * 遮罩淡入
     * @param color 遮罩颜色
     * @param time 淡入事件
     */
    this.maskFadeIn = function(color,time){
        if(mask != null) {
            mask.dispose();
            mask = null;
        }
        mask = new ISprite(RV.NowProject.gameWidth , RV.NowProject.gameHeight , color);
        mask.z = 7000;
        mask.fade(0,1.0,time);


    };

    /**
     * 遮罩淡出
     * @param time 淡出时间
     */
    this.maskFadeOut = function(time){
        if(mask == null) return;
        mask.fadeTo(0 , time);
    };

    /**
     * 播放动画
     * @param animId 动画ID
     * @param endFuc 动画结束回调
     * @param actor 动画相对LActor对象
     * @param isSingle 是否只播放一遍
     * @param rect 动画相对Rect
     * @param tag 绑定值
     * @returns {boolean}
     */
    this.playAnim = function(animId,endFuc,actor,isSingle,rect,tag){
        var data = RV.NowSet.findResAnim(animId);
        var id = parseInt(tag);
        if(data == null) {
            if(endFuc != null){
                endFuc();
            }
            return;
        }
        var am = null;
        var haveView = true;
        var point = data.point;
        if(point.type == 0){//相对坐标
            if(point.dir == 5){//画面
                haveView = false;
            }
        }else{//绝对坐标
            haveView = false;
        }

        if(data instanceof DResAnimFrame){
            am = new LAnim(data,haveView ? RV.NowCanvas.getView() : null,isSingle,actor,rect,id);
        }else if(data instanceof  DResAnimParticle){
            am = new LParticle(data,haveView ? RV.NowCanvas.getView() : null,isSingle,actor,rect,id);
        }
        am.tag = tag;
        am.endDo = function(){
            am.dispose();
            _sf.anim.remove(am);
            if(endFuc != null){
                endFuc();
            }

        };

        if(am != null){
            this.anim.push(am);
            return am;
        }
        return null;
    };
    /**
     * 获得场景视窗
     * @returns {IViewport}
     */
    this.getView = function(){
        return view;
    };

    this.findAnim = function(tag){
        for(var i = 0;i<_sf.anim.length;i++){
            if(_sf.anim[i].tag == tag){
                return _sf.anim[i];
            }
        }
        return null;
    };
    /**
     * 震动数据初始化
     */
    function shakeInit(){
        oldVpX = view.ox;
        oldVpY = view.oy;
        ShakePower = 0;
        ShakeSpeed = 0;
        ShakeDuration = 0;
        ShakeDirection = 1;
        Shake = 0;
    }
    /**
     * 开始震动
     * @param power 强度
     * @param speed 速度
     * @param duration 事件
     */
    this.startShack = function( power, speed, duration){
        ShakePower = power;
        ShakeSpeed = speed;
        ShakeDuration = duration;
        oldVpX = view.ox;
        oldVpY = view.oy;
        StartShake = true;
    };
    /**
     * 震动数据刷新
     */
    function updateShack(){
        if(ShakeDuration >= 1  || Shake != 0 || ShakeDuration == -1){
            var delta =ShakePower * ShakeSpeed * ShakeDirection / 10.0;
            if( (ShakeDuration != -1 && ShakeDuration <= 1) || Shake * (Shake + delta) < 0){
                Shake = 0;
            }else{
                Shake += delta;
            }
            if(Shake > ShakePower * 2){
                ShakeDirection -= 1;
            }
            if(Shake < -ShakePower * 2){
                ShakeDirection += 1;
            }
            if(ShakeDuration >= 1){
                ShakeDuration -= 1;
            }
            if(Shake == 0 && ShakeDuration >= 1){
                Shake = 1;
            }
        }
    }

    /**
     * 震动视窗刷新
     */
    function updateViewport(){
        if(Shake == 0) {
            if(StartShake){
                StartShake = false;
                view.ox = oldVpX;
                view.oy = oldVpY;
            }
            return;
        }
        var f = rand(0,10);
        view.ox = oldVpX + (f % 2 == 0 ? Shake : Shake * -1);
        f = rand(0,10);
        view.oy = oldVpY + (f % 2 == 0 ? Shake : Shake * -1);
    }

}/**
 * Created by 七夕小雨 on 2018/7/19.
 * 文字选项逻辑
 */
function LChoice(){
    var _sf = this;
    //最后选的选项索引
    this.index = -1;
    //是否结束
    this.isW = false;
    //选项精灵集合
    this.bList = [];
    //结束回调
    this.end = null;
    //倒计时选项时间归零回调
    this.timeEnd = null;

    //选项图片资源
    var bitmapM,bitmapB;
    //是否关闭
    var isClose;

    var data = RV.NowUI.uis[RV.NowSet.setAll.MsgIfid];
    if(data == null){
        throw "Text divergence is not set 文本分歧界面未设置"
    }

    var checkData = data.findData("chooseGroup");
    if(checkData == null){
        throw "缺少 Key 为 chooseGroup的控件"
    }

    var textData = checkData.checks[0].text;

    var files = checkData.getFiles();

    bitmapM = RF.LoadBitmap(files[1]);
    bitmapB = RF.LoadBitmap(files[0]);

    var nowIndex = 0;
    var tempIndex = -1;

    var countDown = -1;
    var timeSp = null;
    /**
     * 加载文字选项
     * @param list 文字内容数组
     * @param z z图层
     */
    this.setupChoice = function(list,z) {

        _sf.dispose();

        if(list == null || list.length <= 0) return;
        var index = 0;
        var ww = 0;
        var hh = 0;
        for (var i = 0; i < list.length; i++) {
            var choice = RF.MakerValueText(list[i]);
            var temp = RF.TextAnalysisNull(choice);
            var bt = new IButton(bitmapB,bitmapM," ",null,false);
            var w = IFont.getWidth(temp, textData.fontSize);
            var h = IFont.getHeight(temp, textData.fontSize);
            var tx = 0;
            var ty = 0;

            if(textData.HAlign == 0){
                tx = textData.x;
            }else if(textData.HAlign == 1){
                tx = (bitmapB.width - w) / 2 + textData.x;
            }else{
                tx = (bitmapB.width - w) + textData.x;
            }

            if(textData.VAlign == 0){
                ty = textData.y;
            }else if(textData.HAlign == 1){
                ty = (bitmapB.height - h) / 2 + textData.y;
            }else{
                ty = (bitmapB.height - h) + textData.y;
            }
            bt.getBack().angle = checkData.angle;
            bt.getText().angle = checkData.angle;
            bt.zoomX = checkData.zoomX / 100;
            bt.zoomY = checkData.zoomY/ 100;
            bt.opacity =checkData.opacity / 255;
            bt.drawTitle(textData.fontColor.TColor() + "\\s[" + textData.fontSize + "]" + choice , tx , ty );
            bt.z = data.level + checkData.level;
            bt.x = i * checkData.dx;
            bt.y = i * checkData.dy;
            bt.setOpactiy(0);
            bt.fadeTo(1,20);
            if(bt.x + bt.width > ww){
                ww = bt.x + bt.width;
            }
            if(bt.y + bt.height > hh){
                hh = bt.y + bt.height;
            }
            _sf.bList.push(bt);
        }
        var endX = 0;
        var endY = 0;
        if(checkData.HAlign == 0){
            endX = checkData.x;
        }else if(checkData.HAlign == 1){
            endX = (RV.NowProject.gameWidth - ww) / 2 + checkData.x;
        }else{
            endX = (RV.NowProject.gameWidth - ww) + checkData.x;
        }
        if(checkData.VAlign == 0){
            endY = checkData.y;
        }else if(checkData.VAlign == 1){
            endY = (RV.NowProject.gameHeight - hh) / 2 + checkData.y;
        }else{
            endY = (RV.NowProject.gameHeight - hh) + checkData.y;
        }
        for(i = 0;i<_sf.bList.length;i++){
            _sf.bList[i].x += endX;
            _sf.bList[i].y += endY;
        }
        _sf.index = -1;
        this.isW = true;
        isClose = false;
        nowIndex = 0;
        updateIndex();
    };

    this.setupChoiceEx = function(evt) {

        _sf.dispose();
        var list = evt.events;

        if(list == null || list.length <= 0) return;
        var index = 0;
        var ww = 0;
        var hh = 0;
        for (var i = 0; i < list.length; i++) {

            var now = list[i];

            var choice = RF.MakerValueText(now.args[0]);
            var temp = RF.TextAnalysisNull(choice);
            var bt = null;
            var w = IFont.getWidth(temp, textData.fontSize);
            var h = IFont.getHeight(temp, textData.fontSize);
            if(now.args[5] == "1"){


                bt = new IButton(bitmapB,bitmapM," ",null,false);
                var obj = {
                    w:w,
                    h:h,
                    bt :bt,
                    choice : choice
                };
                var bmp1 = RF.LoadCache("System\\" + now.args[6],function(bmp,obj){
                    if(bmp == null) return;
                    var tx = 0;
                    var ty = 0;

                    if(textData.HAlign == 0){
                        tx = textData.x;
                    }else if(textData.HAlign == 1){
                        tx = (bmp.width - obj.w) / 2 + textData.x;
                    }else{
                        tx = (bmp.width - obj.w) + textData.x;
                    }
                    if(textData.VAlign == 0){
                        ty = textData.y;
                    }else if(textData.HAlign == 1){
                        ty = (bmp.height - obj.h) / 2 + textData.y;
                    }else{
                        ty = (bmp.height - obj.h) + textData.y;
                    }
                    obj.bt.drawTitle(textData.fontColor.TColor() + "\\s[" + textData.fontSize + "]" + obj.choice , tx , ty );
                },obj);
                var bmp2 = RF.LoadCache("System\\" + now.args[7]);
                bt.setBitmap(bmp1 , bmp2);
                bt.tagBmp1 = bmp1;
                bt.tagBmp2 = bmp2;
            }else{
                bt = new IButton(bitmapB,bitmapM," ",null,false);
            }

            var tx = 0;
            var ty = 0;

            if(bt.tagBmp1 == null){
                if(textData.HAlign == 0){
                    tx = textData.x;
                }else if(textData.HAlign == 1){
                    tx = (bitmapB.width - w) / 2 + textData.x;
                }else{
                    tx = (bitmapB.width - w) + textData.x;
                }
                if(textData.VAlign == 0){
                    ty = textData.y;
                }else if(textData.HAlign == 1){
                    ty = (bitmapB.height - h) / 2 + textData.y;
                }else{
                    ty = (bitmapB.height - h) + textData.y;
                }
                bt.drawTitle(textData.fontColor.TColor() + "\\s[" + textData.fontSize + "]" + choice , tx , ty );
            }

            bt.getBack().angle = checkData.angle;
            bt.getText().angle = checkData.angle;
            bt.zoomX = checkData.zoomX / 100;
            bt.zoomY = checkData.zoomY/ 100;
            bt.opacity =checkData.opacity / 255;

            bt.z = data.level + checkData.level + (i * 2);
            if(now.args[2] == "0"){
                bt.x = i * checkData.dx;
                bt.y = i * checkData.dy;
                if(bt.x + bt.width > ww){
                    ww = bt.x + bt.width;
                }
                if(bt.y + bt.height > hh){
                    hh = bt.y + bt.height;
                }
            }else{
                bt.x = parseInt(now.args[3]);
                bt.y = parseInt(now.args[4]);
            }

            if(now.args[1] != ""){
                var main = now.args[1].split('Φ');
                var difi = new DIfItem();
                difi.type = parseInt(main[0]);
                difi.num1Index = parseInt(main[1]);
                difi.fuc = parseInt(main[2]);
                difi.type2 = parseInt(main[3]);
                difi.num2 = main[4];
                difi.num2Index =parseInt(main[5]);

                bt.dif = difi;
                bt.difTips = now.args[10];
            }

            if(now.args[8] == "1"){
                bt.setAction(action.wait, 30 + (parseInt(now.args[9]) * 60) + 5);
                bt.setAction(action.fade,0,30);
            }

            if(now.args[11] == "2"){
                bt.visible = bt.dif.result()
            }

            bt.setOpactiy(0);
            bt.fadeTo(1,20);
            _sf.bList.push(bt);
        }
        var endX = 0;
        var endY = 0;
        if(checkData.HAlign == 0){
            endX = checkData.x;
        }else if(checkData.HAlign == 1){
            endX = (RV.NowProject.gameWidth - ww) / 2 + checkData.x;
        }else{
            endX = (RV.NowProject.gameWidth - ww) + checkData.x;
        }
        if(checkData.VAlign == 0){
            endY = checkData.y;
        }else if(checkData.VAlign == 1){
            endY = (RV.NowProject.gameHeight - hh) / 2 + checkData.y;
        }else{
            endY = (RV.NowProject.gameHeight - hh) + checkData.y;
        }
        for(i = 0;i<_sf.bList.length;i++){
            if(evt.events[i].args[2] == "0"){
                _sf.bList[i].x += endX;
                _sf.bList[i].y += endY;
            }
        }
        if(evt.args[0] == "1"){
            countDown = parseInt(evt.args[1]) * 60;
            RF.LoadCache("System/" + evt.args[2],function(bmp){
                if(bmp != null){
                    timeSp = new ISprite(IBitmap.CBitmap( (bmp.width / 10) * evt.args[1].length,bmp.height  ));
                    timeSp.tag = bmp;
                    var minW = parseInt(bmp.width / 10);
                    var ary = evt.args[1].split("");
                    for(var i = 0;i< ary.length;i++){
                        var n = parseInt(ary[i]);
                        var bCof = new IBCof(bmp , n * minW , 0 , minW , timeSp.height);
                        timeSp.drawBitmapBCof(i * bCof.width,0,bCof,false);
                    }
                    timeSp.time = parseInt(evt.args[1]);
                    timeSp.z = data.level + 20;
                    timeSp.x = endX + _sf.bList[0].width - timeSp.width + parseInt(evt.args[3]);
                    timeSp.y = (endY - timeSp.height - 20) + parseInt(evt.args[4]);
                }else{
                    timeSp = null;
                }
            });
        }else{
            countDown = -1;
        }
        _sf.index = -1;
        this.isW = true;
        isClose = false;
        nowIndex = 0;
        updateIndex();
    };

    function updateIndex(){
        if(nowIndex == tempIndex) return;
        tempIndex = nowIndex;
        for (var i = 0; i < _sf.bList.length; i++) {
            if(nowIndex == i){
                if(_sf.bList[i].tagBmp1 != null && _sf.bList[i].tagBmp2 != null){
                    _sf.bList[i].setBitmap(_sf.bList[i].tagBmp2,_sf.bList[i].tagBmp1,false);
                }else{
                    _sf.bList[i].setBitmap(bitmapM,bitmapB,false);
                }
            }else{
                if(_sf.bList[i].tagBmp1 != null && _sf.bList[i].tagBmp2 != null){
                    _sf.bList[i].setBitmap(_sf.bList[i].tagBmp1,_sf.bList[i].tagBmp2,false);
                }else{
                    _sf.bList[i].setBitmap(bitmapB,bitmapM,false);
                }


            }
        }
    }

    /**
     * 主循环
     */
    this.update = function(){
        if(!this.isW) return;
        //鼠标控制
        for (var i = 0; i < this.bList.length; i++) {
            var bt = this.bList[i];
            if(bt == null || bt.opacity <= 0) continue;
            if(bt.isClick()){
                if(bt.dif == null || bt.dif.result()){
                    _sf.index = i;
                    _sf.closeChoice();
                    if(_sf.end != null){
                        _sf.end(_sf.index);
                    }
                    return;
                }else{
                    RF.ShowTips(bt.difTips);
                }

            }
            if(bt.getBack().isSelectTouch() == 1){
                nowIndex = i;
                updateIndex()
            }
        }
        //倒计时
        if(countDown > 0){
            countDown -= 1;
            if(timeSp != null && parseInt(countDown / 60) != timeSp.time ){
                timeSp.time = parseInt(countDown / 60);
                timeSp.clearBitmap();
                var minW = parseInt(timeSp.tag.width / 10);
                var ary = (timeSp.time + "").split("");
                for(i = 0;i< ary.length;i++){
                    var n = parseInt(ary[i]);
                    var bCof = new IBCof(timeSp.tag , n * minW , 0 , minW , timeSp.height);
                    timeSp.drawBitmapBCof(i * bCof.width,0,bCof,false);
                }

            }
            if(countDown <= 0){
                _sf.closeChoice();
                if(_sf.timeEnd != null){
                    _sf.timeEnd();
                }

            }
        }
        //键盘控制
        if(IInput.isKeyDown(RC.Key.down) || IInput.isKeyDown(40)){//下
            nowIndex += 1;
            if(nowIndex >= this.bList.length) nowIndex = 0;
            updateIndex();
        }
        if(IInput.isKeyDown(RC.Key.up) || IInput.isKeyDown(38)){//上
            nowIndex -= 1;
            if(nowIndex < 0) nowIndex = this.bList.length - 1;
            updateIndex();
        }
        if(RC.IsKeyOK() || IInput.isKeyDown(108)){
            bt = this.bList[nowIndex];
            if(bt.dif == null || bt.dif.result()){
                _sf.index = nowIndex;
                _sf.closeChoice();
                if(_sf.end != null){
                    _sf.end(_sf.index);
                }
            }else{
                RF.ShowTips(bt.difTips);
            }

        }

    };
    /**
     * 关闭选项
     */
    this.closeChoice = function(){
        for (var i = 0; i < this.bList.length; i++) {
            var bt = this.bList[i];
            if(bt == null ) continue;
            bt.fadeTo(0,10);
        }
        if(timeSp != null){
            timeSp.dispose();
            timeSp = null;
        }
        _sf.isW = false;
        isClose = true;
    };

    /**
     * 释放
     */
    this.dispose = function(){
        if(_sf.bList != null){
            for (var i = 0; i < this.bList.length; i++) {
                var bt = this.bList[i];
                if(bt == null ) continue;
                bt.disposeMin();
            }
            if(timeSp != null){
                timeSp.dispose();
                timeSp = null;
            }
            _sf.bList = [];
        }

    };



}/**
 * Created by 七夕小雨 on 2019/1/8.
 * 地图处理逻辑
 * @param id 地图ID
 * @param func 回调函数
 * @param x 初始化角色x坐标
 * @param y 初始化橘色y坐标
 */
function LMap(id,func,x,y){

    var _sf = this;
    this.id = id;
    //当前地图全局化
    RV.NowMap = this;
    //切换地图回调
    this.changeMap = null;

    //获得到地图数据
    var data = RV.NowProject.findMap(id);
    var scene = RV.NowRes.findResMap(data.backgroundId);
    //计算地图尺寸
    var width = data.width * RV.NowProject.blockSize;
    var height = data.height * RV.NowProject.blockSize;
    //生成地图视窗
    var view = new IViewport(0 , 0 , RV.NowProject.gameWidth , RV.NowProject.gameHeight);
    view.z = 10;

    var actor = null;//操作的角色
    //双远景
    var back1 = null;
    var back2 = null;
    //基础图块数据
    var mapData = [];
    // 震动使用
    var ShakePower,ShakeSpeed,ShakeDuration,ShakeDirection,Shake;
    var oldVpX,oldVpY;
    var StartShake;
    //视窗移动所需
    this.viewMove = false;
    this.viewSpeed = 0;
    this.viewDis = 0;
    this.viewDir = 0;
    //绘制敌人
    this.drawEnemys = function(enemy,camp){
        var e = new LEnemy(enemy , view , mapData , interactionBlock,data);
        if(camp != null){
            e.getActor().camp = camp;
        }
        enemys.push(e);
    };
    //震动初始化
    shakeInit();
    //初始化地图背景
    if(scene.background1.file != "" && scene.background1.file != null){
        back1 = new ISprite(RF.LoadBitmap("Scene/" + scene.background1.file));
        back1.tiling = scene.background1.type == 0;
        if(back1.tiling){
            back1.RWidth = width;
            back1.RHeight = height;
        }
        back1.z = 1;
    }

    if(scene.background2.file != "" && scene.background2.file != null){
        back2 = new ISprite(RF.LoadBitmap("Scene/" + scene.background2.file),view);
        back2.tiling = scene.background2.type == 0;
        if(back2.tiling){
            back2.RWidth = width;
            back2.RHeight = height;
        }
        back2.z = 2;
    }

    //静态处理在这里
    var mapSprite = new Array(5);
    //动态
    var block = [];
    var interactionBlock = [];
    var decorates = [];
    var enemys = [];
    var trigger = [];


    var isInit = false;

    //读取地图图片资源
   function loadRes(func){
        var nowIndex = 0;
        var maxIndex = 0;

        maxIndex += scene.blocks.length;
        maxIndex += scene.decorates.length;

        for(var i = 0;i<scene.blocks.length;i++){
            var rb = RV.NowRes.findResBlock(scene.blocks[i].id) ;
            RF.LoadCache("Block/" + rb.file,function(){
                nowIndex += 1;
                if(nowIndex >= maxIndex){
                    func();
                }
            },null);
        }

        for(i = 0;i < scene.decorates.length ; i++){
            var rd = RV.NowRes.findResDecorate(scene.decorates[i]);
            RF.LoadCache("Decorate/" + rd.file,function(){
                nowIndex += 1;
                if(nowIndex >= maxIndex){
                    func();
                }
            },null)
        }

       if(maxIndex <= 0){
           func();
       }


    }


    /**
     * 初始化地图
     * @param x 要移动的x坐标
     * @param y 要移动的y坐标
     * @param needNewActor 是否重新创建Actor
     */
    function init(x,y,needNewActor){
        mapData = [];
        //对应图层的z坐标
        var zA = [10,210,220,230,1000];
        //生成5张大精灵，分别对应场景精灵
        for(var i = 0; i < 5; i++){
            mapSprite[i] = new ISprite(IBitmap.CBitmap(width,height),view);
            mapSprite[i].z = zA[i];
        }
        //开始绘制图块与配饰
        for(i = 0 ; i < data.width ; i++){
            mapData[i] = [];
            for(var j = 0 ; j < data.height ; j++){
                mapData[i][j] = -9976;
                //背景饰品
                if(data.backgroud[i][j] > 0){
                    drawDecorate(mapSprite[0],decorates,i,j,data.backgroud[i][j] - 1,zA[0])
                }
                //图层块
                if(data.level1[i][j] != null){
                    drawBlock(mapSprite[1],block,i,j,data.level1[i][j],zA[1]);
                }
                if(data.level2[i][j] != null){
                    drawBlock(mapSprite[2],block,i,j,data.level2[i][j],zA[2]);
                }
                if(data.level3[i][j] != null){
                    drawBlock(mapSprite[3],block,i,j,data.level3[i][j],zA[3]);
                }
                //前景饰品
                if(data.decorate[i][j] > 0){
                    drawDecorate(mapSprite[4],decorates,i,j,data.decorate[i][j] - 1,zA[4]);
                }
            }

        }

        //将橘色放进对应位置
        if(needNewActor || actor == null){
            actor = new LActor(view,width,height,mapData,interactionBlock,x * RV.NowProject.blockSize,y * RV.NowProject.blockSize,
                RV.NowSet.findActorId(RV.GameData.actor.getActorId()).actorId,200 );
        }else{
            var oldP = actor.getCharacter().CanPenetrate;
            actor.getCharacter().CanPenetrate = true;
            actor.setInitData(width,height,mapData,interactionBlock);
            actor.getCharacter().x = x * RV.NowProject.blockSize;
            actor.getCharacter().y = y * RV.NowProject.blockSize;
            actor.getCharacter().CanPenetrate = oldP;
        }

        actor.IsGravity = RV.GameData.isGravity;
        actor.IsCanPenetrate = RV.GameData.isCanPenetrate;
        actor.GravityNum = (RV.GameData.gravityNum / 100) * data.gravity;
        actor.JumpNum = RV.GameData.jumpNum * data.resistance;
        actor.JumpTimes = RV.GameData.jumpTimes;
        actor.isLook = true;
        actor.isLook = true;
        actor.atkDis = RV.GameData.actor.getAtkDis();
        actor.bulletId = RV.GameData.actor.getBulletAnimId();
        actor.atkType = RV.GameData.actor.getSetData().attackType;
        actor.camp = 0;
        actor.lookActor();
        actor.getCharacter().getSpirte().mirror = RV.GameData.dir == 1;
        actor.getCharacter().isActor = true;
        //绘制敌人
        for(i = 0 ; i < data.enemys.length ; i++){
            _sf.drawEnemys(data.enemys[i]);
        }
        //绘制交互块
        for(i = 0 ; i < data.trigger.length;i++){
            trigger.push(new LTrigger(data.trigger[i],view , mapData , interactionBlock,data));
        }

        //播放地图音乐
        data.bgm.play(0);
        data.bgs.play(1);
        _sf.viewMove = data.autoMove;
        _sf.viewSpeed = data.autoMoveSpeed;
        _sf.viewDir = data.autoDir;

        if(RV.GameData.getMapData() != null){
            _sf.loadMap(RV.GameData.getMapData());
            RV.GameData.clearMapData();
        }
    }


    /**
     * 绘制图块
     * @param mapSp 地图承载精灵
     * @param blocks 图块集合
     * @param x x坐标
     * @param y y坐标
     * @param block 图块数据
     * @param z z图层
     */
    function drawBlock(mapSp,blocks,x,y,block,z){
        var rbb = null;
        if(block.type != -1){
            if(block.id < scene.blocks.length){
                rbb = RV.NowRes.findResBlock(scene.blocks[block.id].id);
                if(rbb != null){
                    if(scene.blocks[block.id].type == 4){
                        if(rbb.drawType == 0){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }else if(rbb.drawType == 1 && (block.drawIndex == 20 || block.drawIndex == 21 || block.drawIndex == 22 ||
                            block.drawIndex == 23 || block.drawIndex == 33 || block.drawIndex == 34 || block.drawIndex == 35 ||
                            block.drawIndex == 36 || block.drawIndex == 37 || block.drawIndex == 42 || block.drawIndex == 43 ||
                            block.drawIndex == 45 || block.drawIndex == 46 || block.drawIndex == 47)){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }else if(rbb.drawType == 2 && (block.drawIndex == 0 || block.drawIndex == 1 || block.drawIndex == 2)){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }
                    }else{
                        setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                    }
                }


            }
        }else{
            var sbi = RV.NowSet.findBlockId(block.id);
            interactionBlock.push(new LInteractionBlock(sbi,block ,view,x,y, z ,mapData , interactionBlock,data));
            return;
        }

        if(rbb != null){
            var r = null;
            var tx = 0;
            var ty = 0;
            var cof = null;
            var tempx = 0;
            var tempy = 0;
            if(rbb.anim.length == 1){
                r = rbb.anim[0].getRect();
                if(rbb.drawType == 0){
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left, r.top, r.width, r.height);
                }else if(rbb.drawType == 1){
                    tempx = block.drawIndex % 8;
                    tempy = parseInt(block.drawIndex / 8);
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left + tempx * RV.NowProject.blockSize,
                        r.top + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
                }else if(rbb.drawType == 2){
                    tempx = block.drawIndex % 3;
                    tempy = parseInt(block.drawIndex / 3);
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left + tempx * RV.NowProject.blockSize,
                        r.top + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
                }
                tx = x * RV.NowProject.blockSize;
                ty = y * RV.NowProject.blockSize;
                mapSp.drawBitmapBCof(tx , ty , cof , false);
            }else{
                blocks.push(new LBlock(rbb,block,view,x,y,z));
            }
        }
    }


    /**
     * 设置基础图块信息
     * @param x x坐标
     * @param y y坐标
     * @param block 地图图块数据
     * @param rbb 资源图块数据
     */
    function setBaseBlockType(x,y,block,rbb){
        if(block.type == 2){//陷入块单独读取
            if(mapData[x][y] >= 0) return;
            if(rbb.mDie){
                mapData[x][y] = 3000 + rbb.mNum;
            }else{
                mapData[x][y] = 2000 + rbb.mNum;
            }
        }else{
            mapData[x][y] = block.type;
        }

    }


    /**
     * 绘制配饰图块
     * @param mapSp 地图精灵
     * @param decorates 配饰集合
     * @param x x坐标
     * @param y y坐标
     * @param index 配饰配置ID
     * @param z z图层
     */
    function drawDecorate(mapSp , decorates , x , y , index , z){
        var rd = scene.getDec(index);
        if(rd != null){
            var r = null;
            if(rd.type == 0 && rd.anim.length == 1){
                r = rd.anim[0].getRect();
                var cof = new IBCof(RF.LoadCache("Decorate/" + rd.file) , r.left, r.top, r.width, r.height);
                var tx = x * RV.NowProject.blockSize;
                tx = tx - (r.width - RV.NowProject.blockSize) / 2;
                var ty = (y + 1) * RV.NowProject.blockSize;
                ty = ty - r.height;
                mapSp.drawBitmapBCof(tx , ty , cof , false)
            }else{
                var dec = new LDecorate(rd,view,width,height,x,y,z);
                decorates.push(dec);
            }
        }
    }


    /**
     * 刷新
     */
    this.update = function(){
        if(isInit) return;
        if(back1 != null){
            back1.x = view.ox / 2;
            back1.y = view.oy;
        }

        for(var i = 0;i<decorates.length;i++){
            decorates[i].update();
        }
        for(i = 0;i<block.length;i++) {
            block[i].update();
        }
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].update();
        }
        for(i = 0;i<enemys.length;i++){
            enemys[i].update();
        }
        for(i = 0 ; i < trigger.length;i++){
            trigger[i].update();
        }
        if(actor != null){
            actor.update();
            oldVpX = view.ox;
            oldVpY = view.oy;
        }
        updateShack();
        updateViewport();
    };

    /**
     * 释放
     */
    this.dispose = function(noDisposeActor){
        if(back1 != null) back1.dispose();
        if(back2 != null) back2.dispose();
        back1 = null;
        back2 = null;

        mapData = [];

        for(var i = 0;i<mapSprite.length;i++){
            mapSprite[i].dispose();
            mapSprite[i] = null;
        }
        mapSprite = new Array(5);

        for(i = 0;i<decorates.length;i++){
            decorates[i].dispose();
        }
        for(i = 0;i<block.length;i++) {
            block[i].dispose();
        }
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].dispose();
        }
        for(i = 0;i<enemys.length;i++){
            enemys[i].dispose();
        }
        for(i = 0 ; i < trigger.length;i++){
            trigger[i].dispose();
        }
        if(actor != null && noDisposeActor == null){
            actor.dispose();
        }

        block = [];
        interactionBlock = [];
        decorates = [];
        enemys = [];
        trigger = [];
    };

    /**
     * 设置镜头位置
     * @param x
     * @param y
     */
    this.setXY = function(x,y){
        view.ox = x;
        view.oy = y;
    };

    /**
     * 获得地图操作角色
     * @returns {*}
     */
    this.getActor = function(){
        return actor;
    };

    /**
     * 获得地图数据
     * @returns {DMap}
     */
    this.getData = function(){
        return data;
    };

    /**
     * 更改世界重力
     * @param gravity
     */
    this.changeGravityNum = function(gravity){
        //世界重力赋值
        RV.GameData.gravityNum = gravity;
        //修正地图角色重力
        actor.GravityNum = (RV.GameData.gravityNum / 100) * data.gravity;
        actor.Speed[0] = 0;
        //修正触发器重力
        for(var i = 0;i<trigger.length;i++){
            trigger[i].updateGravityNum();
        }
        //修正敌人
        for(i = 0;i<enemys.length;i++){
            enemys[i].updateGravityNum();
        }
        //交互块需要重置相关速度
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].speed[0] = 0;
        }

    };

    /**
     * 获得地图视窗
     * @returns {IViewport}
     */
    this.getView = function(){
        return view;
    };

    /**
     * 获得地图所有敌人
     * @returns {Array}
     */
    this.getEnemys = function(){
        return enemys;
    };

    /**
     * 获得地图基础图块
     * @returns {Array}
     */
    this.getMapData = function(){
        return mapData;
    };

    /**
     * 获得地图所有触发器
     * @returns {Array}
     */
    this.getEvents = function(){
        return trigger;
    };

    /**
     * 寻找敌人
     * @param index
     * @returns {null|*}
     */
    this.findEnemy = function(index){
        for(var i = 0;i<enemys.length;i++){
            if(enemys[i].index == index){
                return enemys[i];
            }
        }
        return null;
    };

    /**
     * 寻找触发器
     * @param id
     * @returns {null|*}
     */
    this.findEvent = function(id){
        if(typeof(id)=='string'){
            return _sf.findBlock(id);
        }else{
            for(var i = 0;i<trigger.length;i++){
                if(trigger[i].id == id){
                    return trigger[i];
                }
            }
        }
        return null;
    };

    /**
     * 寻找交互块
     * @param mark
     * @returns {*}
     */
    this.findBlock = function(mark){
        for(var i = 0;i<interactionBlock.length;i++){
            if(interactionBlock[i].mark == mark){
                return interactionBlock[i];
            }
        }
    };


    /**
     * 移动/切换地图
     * @param mapId 地图ID
     * @param x x坐标
     * @param y y坐标
     * @param dir 方向
     * @param end 切换完毕回调
     */
    this.moveMap = function(mapId,x,y,dir,end){

        if(mapId == data.id){
            actor.getCharacter().x = x * RV.NowProject.blockSize;
            actor.getCharacter().y = y * RV.NowProject.blockSize;
            actor.getCharacter().setLeftRight(dir == 1);
            actor.stopAction();
            end();
            return;
        }
        this.dispose(true);
        data = RV.NowProject.findMap(mapId);
        _sf.id = mapId;
        scene = RV.NowRes.findResMap(data.backgroundId);
        IVal.scene.getMainUI().callBossBar(null);
        width = data.width * RV.NowProject.blockSize;
        height = data.height * RV.NowProject.blockSize;

        if(scene.background1.file != "" && scene.background1.file != null){
            back1 = new ISprite(RF.LoadBitmap("Scene/" + scene.background1.file));
            back1.tiling = scene.background1.type == 0;
            if(back1.tiling){
                back1.RWidth = width;
                back1.RHeight = height;
            }
            back1.z = 1;
        }

        if(scene.background2.file != "" && scene.background1.file != null){
            back2 = new ISprite(RF.LoadBitmap("Scene/" + scene.background2.file),view);
            back2.tiling = scene.background2.type == 0;
            if(back2.tiling){
                back2.RWidth = width;
                back2.RHeight = height;
            }
            back2.z = 2;
        }

        if(data != null){
            loadRes(function(){
                isInit = true;
                init(x,y,false);
                actor.stopAction();
                if(dir >= 0){
                    actor.getCharacter().setLeftRight(dir == 1);
                }
                if(_sf.changeMap != null) _sf.changeMap(actor);
                end();
                isInit = false;
            });
        }

    };

    this.saveMap = function(){
        var eny = [];
        for(var i = 0;i<enemys.length;i++){
            if(enemys[i].index >= 0){
                eny[enemys[i].index] = enemys[i].save();
            }
        }
        var tri = [];
        for(i = 0;i<trigger.length;i++){
            tri[trigger[i].id] = trigger[i].save();
        }
        var blk = {};
        for(i = 0;i<interactionBlock.length;i++){
            blk[interactionBlock[i].mark] = interactionBlock[i].save();
        }
        return {
            enemy : eny,
            trigger : tri,
            interactionBlock :blk
        }
    };

    this.loadMap = function(data){
        for(var i = 0;i<enemys.length;i++){
            var index = enemys[i].index;
            if(index >= 0 && data.enemy[index] != null){
                enemys[i].load(data.enemy[index]);
            }
        }
        for(i = 0;i<trigger.length;i++){
            var id = trigger[i].id;
            if(data.trigger[id] != null){
                trigger[i].load(data.trigger[id]);
            }
        }
        for(i = 0;i<interactionBlock.length;i++){
            var mark = interactionBlock[i].mark;
            if(data.interactionBlock[mark] != null){
                interactionBlock[i].load(data.interactionBlock[mark]);
            }
        }

    };

    /**
     * 震动数据初始化
     */
    function shakeInit(){
        oldVpX = view.ox;
        oldVpY = view.oy;
        ShakePower = 0;
        ShakeSpeed = 0;
        ShakeDuration = 0;
        ShakeDirection = 1;
        Shake = 0;
    }

    /**
     * 开始震动
     * @param power 强度
     * @param speed 速度
     * @param duration 事件
     */
    this.startShack = function( power, speed, duration){
        ShakePower = power;
        ShakeSpeed = speed;
        ShakeDuration = duration;
        oldVpX = view.ox;
        oldVpY = view.oy;
        StartShake = true;
    };

    /**
     * 震动数据刷新
     */
    function updateShack(){
        if(ShakeDuration >= 1  || Shake != 0 || ShakeDuration == -1){
            var delta =ShakePower * ShakeSpeed * ShakeDirection / 10.0;
            if( (ShakeDuration != -1 && ShakeDuration <= 1) || Shake * (Shake + delta) < 0){
                Shake = 0;
            }else{
                Shake += delta;
            }
            if(Shake > ShakePower * 2){
                ShakeDirection -= 1;
            }
            if(Shake < -ShakePower * 2){
                ShakeDirection += 1;
            }
            if(ShakeDuration >= 1){
                ShakeDuration -= 1;
            }
            if(Shake == 0 && ShakeDuration >= 1){
                Shake = 1;
            }
        }
    }

    /**
     * 震动视窗刷新
     */
    function updateViewport(){
        if(Shake == 0) {
            if(StartShake){
                StartShake = false;
                view.ox = oldVpX;
                view.oy = oldVpY;
            }
            return;
        }
        var f = rand(0,10);
        view.ox = oldVpX + (f % 2 == 0 ? Shake : Shake * -1);
        f = rand(0,10);
        view.oy = oldVpY + (f % 2 == 0 ? Shake : Shake * -1);
    }

    loadRes(function(){
        isInit = true;
        init(x,y,true);
        func(actor);
        isInit = false;
    });


}/**
 * Created by 七夕小雨 on 2018/2/26.
 * 文本框
 */
function LMessage(){

    var _sf = this;
    var data =  RV.NowSet.setMessage;
    if(data == null){
        throw "Dialog is not set 文本框未设置"
    }
    this.viewport = new IViewport(0, 0, RV.NowProject.gameWidth * 2, RV.NowProject.gameHeight * 2);
    this.viewport.z = 8000;
    //绘制承载
    this.talkBack = null;
    this.talkDraw = null;
    this.nameBack = null;
    this.nameDraw = null;
    this.buttonSkip = null;
    this.buttonAuto = null;
    this.buttonMenu = null;
    //按下后下一帧结束
    this.waitEnd = 0;
    //文本寄存
    this.showText = "";
    this.makeText = "";
    var drawText = "";
    var drawIndex = 0;
    var textGroup = null;

    this.pt = null;
    this.isNext = false;

    this.dx = 0;
    this.dy = 0;
    this.speed = 0;
    this.speedTmp = 0;
    this.isDrawAll = false;
    this.isClick = false;
    this.haveTextBox = true;
    this.haveNameBox = true;
    this.autoSpeed = 0;
    //记录每次设置的临时文本与姓名偏移
    this.oldNdx = 0;
    this.oldNdy = 0;
    this.oldMdx = 0;
    this.oldMdy = 0;

    var rdx = 0;
    var rdy = 0;
    var rdw = 0;
    var Height = 0;
    var rx = 0;
    var ry = 0;

    var spacingH = 0;
    var spacingV = 0;


    var color;
    //文本框震动
    var ShakePower,ShakeSpeed,ShakeDuration,ShakeDirection,Shake;

    var face;
    var fontSize;
    var wait;
    var pass;
    var waitAuto = 0;
    var waitFace = false;

    var setB;

    var isInit = false;
    //对话框是否被隐藏
    var isFadeOut = false;

    this.isMsgFadeOut = function(){
        return isFadeOut;
    };

    /**
     * 对话框消失
     */
    this.fadeOut = function(){
        if(!isInit) return;
        this.pt.visible = false;
        this.talkBack.visible = false;
        this.talkDraw.visible = false;
        this.nameBack.visible = false;
        this.nameDraw.visible = false;
        this.buttonSkip.visible = false;
        this.buttonAuto.visible = false;
        this.buttonMenu.visible = false;
        if(face != null){
            face.visible = false;
        }
        isFadeOut = true;
    };

    RF.CacheUIRes(["System/" + data.buttonJump.path1,"System/" + data.buttonJump.path2,
        "System/" + data.buttonAuto.path1,"System/" + data.buttonAuto.path2,
        "System/" + data.buttonMenu.path1,"System/" + data.buttonMenu.path2,
        "System/" + data.nameBlock.path1,"System/" + data.nameBlock.path2,
        "System/" + data.msgBlock.path1,"System/" + data.msgBlock.path2,
        "System/" + data.cursorPath],initMsg);

    function initMsg(hash){
        rx = RV.NowProject.gameWidth;
        ry = RV.NowProject.gameHeight;
        spacingH = data.spacingH;
        spacingV = data.spacingV;
        _sf.talkBack = LoadBlock(data.msgBlock,8000,hash);
        if(_sf.talkBack != null) {
            Height = _sf.talkBack.height;
        } else {
            Height = 120;
        }
        _sf.talkDraw = new ISprite(IBitmap.CBitmap(data.msgText.width, data.msgText.height),_sf.viewport);
        _sf.talkDraw.x = data.msgBlock.dx + data.msgText.dx + rx;
        _sf.talkDraw.y = data.msgBlock.dy + data.msgText.dy + ry;
        _sf.talkDraw.z = 8003;

        _sf.nameBack = LoadBlock(data.nameBlock,8004,hash);
        _sf.nameDraw = new ISprite(IBitmap.CBitmap(data.nameText.width, data.nameText.height),_sf.viewport);
        _sf.nameDraw.x = data.nameBlock.dx + data.nameText.dx + rx;
        _sf.nameDraw.y = data.nameBlock.dy + data.nameText.dy + ry;
        _sf.nameDraw.z = 8005;

        _sf.buttonSkip = LoadButton(data.buttonJump,data.buttonJump.x,data.buttonJump.y,data.buttonJump.isVisible,8005,hash);
        _sf.buttonAuto = LoadButton(data.buttonAuto,data.buttonAuto.x,data.buttonAuto.y,data.buttonAuto.isVisible,8005,hash);
        _sf.buttonMenu = LoadButton(data.buttonMenu,data.buttonMenu.x,data.buttonMenu.y,data.buttonMenu.isVisible,8005,hash);

        rePos(hash);
        _sf.buttonSkip.tag = 0;
        _sf.buttonAuto.tag = 0;
        _sf.buttonMenu.tag = 0;
        _sf.textSpeed = RV.GameSet.textSpeed;
        _sf.autoSpeed = RV.GameSet.autoSpeed;
        isInit = true;
        _sf.fadeOut();
    }

    function rePos(hash) {
        if(_sf.pt != null) {
            _sf.pt.dispose();
            _sf.pt = null;
        }
        var bmp = hash["System/" + data.cursorPath];
        if(data.cursorPath != "") {
            _sf.pt = new ISprite(bmp,_sf.viewport);
            _sf.pt.x = data.cursorX + rx;
            _sf.pt.y = data.cursorY + ry;
            _sf.pt.z = 8010;
            var speed = 0;
            if(data.cursorDir == 0){
                speed = parseInt(data.cursorSpeed * 7.6666);
                _sf.pt.addAction(action.move, _sf.pt.x,_sf.pt.y,speed);
                _sf.pt.addAction(action.wait, speed);
                _sf.pt.addAction(action.move, _sf.pt.x,_sf.pt.y + 5,speed);
                _sf.pt.addAction(action.wait, speed);
            }else if(data.cursorDir == 1){
                speed = parseInt(data.cursorSpeed * 7.6666);
                _sf.pt.addAction(action.move, _sf.pt.x,_sf.pt.y,speed);
                _sf.pt.addAction(action.wait, speed);
                _sf.pt.addAction(action.move, _sf.pt.x + 5,_sf.pt.y,speed);
                _sf.pt.addAction(action.wait, speed);
            }else if(data.cursorDir == 2){
                speed = 1/data.cursorSpeed * 10;
                _sf.pt.yx = 0.5;
                _sf.pt.yy = 0.5;
                _sf.pt.x += _sf.pt.width / 2;
                _sf.pt.y += _sf.pt.height / 2;
                _sf.pt.startRotate(speed);
            }else{
                speed = -1/data.cursorSpeed * 10;
                _sf.pt.yx = 0.5;
                _sf.pt.yy = 0.5;
                _sf.pt.x += _sf.pt.width / 2;
                _sf.pt.y += _sf.pt.height / 2;
                _sf.pt.startRotate(speed);
            }
            _sf.pt.actionLoop = true;
            _sf.pt.visible = false;
        }else{
            _sf.pt = new ISprite(IBitmap.CBitmap(1,1),_sf.viewport);
        }
    }


    function LoadBlock(block,z,hash) {
        if (block.type == 0) {//使用图片
            var bmp = hash["System/" + block.path1];
            if (block.path1 == "") {
                bmp = IBitmap.CBitmap(500,200)
            }
            var sp = new ISprite(bmp,_sf.viewport);
            sp.x = block.dx + rx;
            sp.y = block.dy + ry;
            sp.z = z;
            return sp;
        } else {//使用自适应图片
            var bmp = hash["System/" + block.path2];
            if (block.path2 == "") {
                bmp = IBitmap.CBitmap(500,200)
            }
            var sp = new LAutoPic(bmp, block.width, block.height, block.x1, block.x2, block.y1, block.y2,_sf.viewport);
            sp.x = block.dx + rx;
            sp.y = block.dy + ry;
            sp.width = block.width;
            sp.height = block.height;
            sp.z = z;
            return sp;
        }
    }

    function LoadButton(button,x,y,isV,z,hash) {
        var bmp1 = hash["System/" + button.path1];
        if(button.path1 == "") {
            bmp1 = IBitmap.CBitmap(1,1);
        }
        var bt = new IButton(bmp1,bmp1," ",_sf.viewport,true);
        bt.x = x + rx;
        bt.y = y + ry;
        bt.z = z;
        bt.visible = isV;
        var sp = bt.getSprite();
        if(button.path1 != ""){
            sp.drawText("\\s[" + button.textSize + "]" + button.textColor.IColor().TColor() + button.text,button.tx,button.ty,0,IColor.Black(),false,0);
        }
        return bt;
    }



    //震动相关
    ShakePower = 0;
    ShakeSpeed = 0;
    ShakeDuration = 0;
    ShakeDirection = 1;
    Shake = 0;
    var noLatin = false;

    this.getIsInit = function(){
        return isInit;
    };
    /**
     * 消失
     */
    this.re = function(){
        _sf.haveTextBox = false;
        _sf.haveNameBox = false;
        setB = true;
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.fadeOut();
    };

    /**
     * 设置文本框位置
     * @param b 可见情况
     * @param pointX 位置X
     * @param pointY 位置Y
     */
    this.setThis = function( b,pointX,pointY){
        rdw = 0;
        rdx = 0;
        rdy = 0;
        _sf.nameBack.visible = b;
        _sf.talkBack.visible = b;
        if(b){
            _sf.buttonSkip.visible = data.buttonJump.isVisible;
            _sf.buttonAuto.visible = data.buttonAuto.isVisible;
            _sf.buttonMenu.visible = RV.GameData.playCGIndex == -1 ? data.buttonMenu.isVisible:false;
        }else{
            _sf.buttonSkip.visible = b;
            _sf.buttonAuto.visible = b;
            _sf.buttonMenu.visible = RV.GameData.playCGIndex == -1 ? b:false;
        }

        setB = b;

        if(b){
            _sf.talkDraw.disposeBitmap();
            _sf.talkDraw.setBitmap(IBitmap.CBitmap(data.msgText.width , data.msgText.height));
        }else{
            _sf.talkDraw.disposeBitmap();
            _sf.talkDraw.setBitmap(IBitmap.CBitmap(RV.NowProject.gameWidth , RV.NowProject.gameHeight));
        }

        _sf.pt.visible = false;
        var bx = - RV.NowProject.gameWidth;
        var by = - RV.NowProject.gameHeight;

        _sf.viewport.x = bx + data.dx;
        if(pointX == "a"){
            _sf.viewport.y = by + data.topY;
        }else if(pointX == "b"){
            _sf.viewport.y = by +((RV.NowProject.gameHeight - Height) / 2) + data.centerY;
        }else if(pointX == "c"){
            _sf.viewport.y = by + (RV.NowProject.gameHeight - Height - 20) - data.bottomY;
        }else{
            _sf.viewport.x =  bx + parseInt(pointX);
            _sf.viewport.y =  by + parseInt(pointY);
        }
        isFadeOut = false;
    };
    /**
     * 设置头像
     * @param path 头像图片路径
     * @param pointX x坐标
     * @param pointY y坐标
     */
    this.setFace = function(path,pointX,pointY){
        if (face != null) {
            face.dispose();
            face = null;
        }
        if (path.length <= 0) return;
        face = new ISprite(RF.LoadBitmap("Picture/" + path),_sf.viewport);
        face.z = 8006;
        waitFace = true;
        face.onload = function(){
            var px = pointX.split("_");
            var py = pointY.split("_");
            if(px[0] == "a"){
                face.x = _sf.talkBack.x + parseInt(px[1]);
                face.y = _sf.talkBack.y + _sf.talkBack.height - face.height + parseInt(py[1]);
                rdx += face.width + parseInt(px[1]);
                _sf.dx += rdx;
            }else{
                face.x = (_sf.talkBack.x + _sf.talkBack.width - face.width) + parseInt(px[1]);
                face.y = (_sf.talkBack.y + _sf.talkBack.height - face.height)+ parseInt(py[1]);
                rdw = face.width - parseInt(px[1]);
            }
            waitFace = false;
        }

    };

    /**
     * 设置对话框其他属性
     * @param hd 字间距
     * @param vd 字行距
     * @param ndx 姓名框偏移x坐标
     * @param ndy 姓名框偏移y坐标
     * @param mdx 文章偏移x坐标
     * @param mdy 文章偏移y坐标
     */
    this.setOther = function(hd,vd,ndx,ndy,mdx,mdy){
        spacingH = hd;
        spacingV = vd;
        _sf.nameBack.x -= _sf.oldNdx;
        _sf.nameDraw.x -= _sf.oldNdx;
        _sf.nameBack.y -= _sf.oldNdy;
        _sf.nameDraw.y -= _sf.oldNdy;
        rdx -= _sf.oldMdx;
        rdy -= _sf.oldMdy;

        _sf.nameBack.x += ndx;
        _sf.nameDraw.x += ndx;
        _sf.nameBack.y += ndy;
        _sf.nameDraw.y += ndy;
        rdx += mdx;
        rdy += mdy;
        _sf.oldNdx = ndx;
        _sf.oldNdy = ndy;
        _sf.oldMdx = mdx;
        _sf.oldMdy = mdy;
    };

    /**
     * 按钮逻辑
     */
    function updateButton(){
        autoRead();
        skipRead();
        _sf.isClick = false;
        if(_sf.buttonSkip.update()){
            changeButtionBitmap(data.buttonJump.path1,data.buttonJump.path2,_sf.buttonSkip)
            return;
        }
        if(_sf.buttonAuto.update()){
            changeButtionBitmap(data.buttonAuto.path1,data.buttonAuto.path2,_sf.buttonAuto)
            return;
        }
        if(_sf.buttonMenu.update()){
            IInput.up = false;
            IInput.down = false;
            RV.NowCanvas.message.waitEnd = 0;
            _sf.isClick = true;
            RV.GameData.menu = -1;
        }

    }
    /**
     * 替换按钮图片
     */
    function changeButtionBitmap(path1,path2,button){
        _sf.isClick = true;
        var bmp1 = RF.LoadCache("System/" + path1);
        var bmp2 = RF.LoadCache("System/" + path2);
        if(path1 == "") {
            button.tag == 0 ? button.tag = 1: 0;
            return;
        }
        if(path2 == "") bmp2 = bmp1;
        if(button.tag == 0){
            button.setBitmap(bmp2,bmp2,true);
            button.tag = 1;
        }else{
            button.setBitmap(bmp1,bmp1,true);
            button.tag = 0;
        }
    }

    /**
     * 开始震动
     * @param power 强度
     * @param speed 速度
     * @param duration 时间
     * @constructor
     */
    this.StartShack = function( power, speed, duration){
        ShakePower = power;
        ShakeSpeed = speed;
        ShakeDuration = duration;
    };

    /**
     * 震动循环处理
     */
    function updateShack(){
        if(ShakeDuration >= 1  || Shake != 0 || ShakeDuration == -1){
            var delta = ( ShakePower * ShakeSpeed * ShakeDirection / 10.0);
            if( (ShakeDuration != -1 && ShakeDuration <= 1) || Shake * (Shake + delta) < 0){
                Shake = 0;
            }else{
                Shake += delta;
            }
            if(Shake > ShakePower * 2){
                ShakeDirection -= 1;
            }
            if(Shake < -ShakePower * 2){
                ShakeDirection += 1;
            }
            if(ShakeDuration >= 1){
                ShakeDuration -= 1;
            }
            if(Shake == 0 && ShakeDuration >= 1){
                Shake = 1;
            }
        }
    }

    /**
     * 更新震动视窗
     */
    function updateViewPort(){
        var f = rand(0,10);
        _sf.viewport.ox = f % 2 == 0 ? Shake : Shake * -1;
        f = rand(0,10);
        _sf.viewport.oy = f % 2 == 0 ? Shake : Shake * -1;
    }

    /**
     * 绘制名称
     * @param name 名称
     */
    function drawName( name){
        if(name.length <= 0){
            _sf.nameDraw.visible = false;
            if(_sf.nameBack != null)_sf.nameBack.visible = false;
            return;
        }else {
            _sf.nameDraw.visible = true;
            if(_sf.nameBack != null)_sf.nameBack.visible = setB;
        }
        var nameT = "\\s[" + data.nameText.textSize + "]" + data.nameText.textColor.TColor() + RF.MakerValueText(name);
        var fSize = ISprite.getDrawTextSize(nameT, false,0 , 1);

        _sf.nameDraw.disposeBitmap();
        _sf.nameDraw.setBitmap(IBitmap.CBitmap(fSize.width, fSize.height));
        _sf.nameDraw.width = fSize.width;
        _sf.nameDraw.height = fSize.height;
        _sf.nameDraw.drawText(nameT, 0, 0, data.nameText.effect, data.nameText.effectColor.IColor(),false, 0);

        if (_sf.nameBack != null) {
            if (data.nameText.type == 0) {//居左
                _sf.nameDraw.x = _sf.nameBack.x + data.nameText.dx;
                _sf.nameDraw.y = _sf.nameBack.y + data.nameText.dy;
            } else if (data.nameText.type == 1) {//居中
                _sf.nameDraw.x = _sf.nameBack.x + (_sf.nameBack.width - _sf.nameDraw.width) / 2 + data.nameText.dx;
                _sf.nameDraw.y = _sf.nameBack.y + data.nameText.dy;
            } else {//居右
                _sf.nameDraw.x = _sf.nameBack.x + _sf.nameBack.width - _sf.nameDraw.width + data.nameText.dx;
                _sf.nameDraw.y = _sf.nameBack.y + data.nameText.dy;
            }
        } else {
            _sf.nameDraw.x = data.nameBlock.dx + data.nameText.dx + rX;
            _sf.nameDraw.y = data.nameBlock.dy + data.nameText.dy + rY;
        }
    }

    /**
     * 文本框是否还在显示文字过程中
     * @returns {boolean}
     */
    this.isShowing = function(){
        return this.showText.length > 0;
    };

    /**
     * 主绘制
     */
    this.updateDraw = function(){
        if(!isInit) return;
        updateButton();
        updateShack();
        updateViewPort();
        if(face != null && waitFace == true){
            return;
        }
        if(this.showText == null || this.showText.length <= 0){
            this.pt.visible = this.talkBack.visible;
            return;
        }
        if(pass){
            this.pt.visible = this.talkBack.visible;
            if(RF.IsNext()){
                IInput.up = false;
                pass = false;
            }
            return;
        }
        if(RF.IsNext()){
            IInput.up = false;
            this.isDrawAll = true;
            _sf.speed = 0;
            _sf.speedTmp = 0;
            return
        }
        if(wait > 0){
            wait -= 1;
            return;
        }

        if(this.speedTmp > 0){
            this.speedTmp -= 1;
            return;
        }else{
            this.speedTmp = this.speed;
        }

        while (true) {
            if(drawText == null || drawText.length <= 0 && drawIndex + 1 < textGroup.length){
                drawIndex += 1;
                drawText = RF.TextAnalysis(textGroup[drawIndex]);
                var w = getDrawTextW(drawText,fontSize);
                if(_sf.talkBack.visible){
                    if(_sf.dx + w >= data.msgText.width - rdw){
                        _sf.dy +=  (IFont.getHeight(min, fontSize) * spacingV);
                        _sf.dx = rdx;
                    }
                }
            }

            if(drawText.length <= 0){

                break;
            }
            var min = drawText.substring(0,1);
            drawText = drawText.substring(1 , drawText.length);
            var c = min.charCodeAt(0);
            if(c == 60000){//换行
                this.dy += (IFont.getHeight(min, 20) * spacingV);
                this.dx = rdx;
            }else if(c == 60001){//更改颜色
                var returnS = TextToTemp(drawText,"[","]","\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
                color = new IColor(returnS[0]);
                drawText = returnS[1];
            }else if(c == 60002){//更改字体大小
                returnS = TextToTemp(drawText , "[","]","\\[([0-9]+)]");
                fontSize = parseInt(returnS[0]);
                drawText = returnS[1];
            }else if(c == 60100){
                //this.showText = RV.User.name + this.showText;
                break;
            }else if(c == 60101){//全部显示
                this.isDrawAll = true;
                _sf.speed = 0;
                _sf.speedTmp = 0;
                break;
            }else if(c == 60102){//等待10帧
                wait = 10;
                break;
            }else if(c == 60103){//等待20帧
                wait = 20;
                break;
            }else if(c == 60104){//等待指定
                returnS = TextToTemp(drawText , "[","]","\\[([0-9]+)]");
                wait = parseInt(returnS[0]);
                drawText = returnS[1];
                break;
            }else if(c == 60105){//自动结束本对话
                this.isNext = true;
                break;
            }else if(c == 60106){//暂停
                pass = true;
                break;
            }else if(c == 60003){//显示变量
                returnS = TextToTemp(drawText , "[","]","\\[([a-zA-Z0-9-_]+)]");
                drawText = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else {
                this.talkDraw.drawText(color.TColor() + "\\s[" + fontSize + "]" + min, _sf.dx, _sf.dy, data.msgText.effect, data.msgText.effectColor.IColor() , false, 0);
                _sf.dx += IFont.getWidth(min,fontSize) * spacingH;
                if(_sf.talkBack.visible){
                    if(_sf.dx >= data.msgText.width - rdw){
                        _sf.dy +=  (IFont.getHeight(min, fontSize) * spacingV);
                        _sf.dx = rdx;
                    }
                }
            }

            if(!this.isDrawAll){
                break;
            }
        }

        if( (drawText == null || drawText.length <= 0) && drawIndex + 1 >= textGroup.length){
            _sf.pt.visible = setB;
            _sf.showText = "";
        }



    };
    /**
     * 自动阅读
     */
    function autoRead(){
        if(_sf.buttonAuto.tag == 1 && !_sf.isShowing()){
            waitAuto += 1;
            if(waitAuto >= 60){
                _sf.isNext = true;
                waitAuto = 0;
            }
        }
    }
    /**
     * 快速跳过
     */
    function skipRead(){
        if(_sf.buttonSkip.tag == 1){
            waitAuto += 1;
            if(waitAuto >= 10){
                _sf.isNext = true;
                waitAuto = 0;
            }
        }
    }

    function getDrawTextW(msg,fs){
        var showText = new String(msg);
        var fontSize = fs;
        var nowW = 0;
        var dx = 0;
        var dy = 0;
        while (true) {
            if(showText.length <= 0){
                break;
            }
            var min = showText.substring(0,1);
            showText = showText.substring(1,showText.length);
            var c = min.charCodeAt(0);
            if(c == 60000){//换行
                dy += (IFont.getHeight(min, fontSize) * spacingV);
                dx = 0;
            }else if(c == 60001){//改变颜色
                var returnS = TextToTemp(showText,"[","]","\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
                showText = returnS[1];
            }else if(c == 60002){//改变字号
                returnS = TextToTemp(showText , "[","]","\\[([0-9]+)]");
                fontSize = parseInt(returnS[0]);
                showText = returnS[1];
            }else if(c == 60100){
            }else if(c == 60101){//全部显示
            }else if(c == 60102){//等待10帧
            }else if(c == 60103){//等待20帧
            }else if(c == 60104){//等待指定
                returnS = TextToTemp(showText , "[","]","\\[([0-9]+)]");
                showText = returnS[1];
            }else if(c == 60105){//去往下段对话
            }else if(c == 60106){//暂停
            }else if(c == 60003){//显示变量
                returnS = TextToTemp(showText , "[","]","\\[([a-zA-Z0-9-_]+)]");
                showText = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else {
                dx += IFont.getWidth(min,fontSize) * spacingH;
                if(dx > nowW){
                    nowW = dx;
                }
            }
        }
        return nowW;
    }

    /**
     * 设置对话
     * @param name 名称
     * @param msg 内容
     * @param speed 文字速度
     */
    this.talk = function( name, msg,speed){
        var tempSpeed = 0;
        tempSpeed = Math.max(0,parseInt(speed) + ((7 - RV.GameSet.textSpeed) - 7 / 2));
        tempSpeed = _sf.buttonAuto.tag == 1 ? (7 - RV.GameSet.autoSpeed):tempSpeed;
        _sf.haveTextBox = true;
        if(name == ""){
            _sf.haveNameBox = false;
        }else{
            _sf.haveNameBox = true;
        }
        wait = 0;
        this.pt.visible = false;
        _sf.fadeIn();
        drawName(name);
        fontSize = data.msgText.textSize;
        this.makeText = msg;
        textGroup = IFont.toGroups(msg);
        drawIndex = -1;
        drawText = "";
        this.talkDraw.clearBitmap();
        this.talkDraw.updateBitmap();
        noLatin = RF.CheckLanguage(msg);
        this.showText = RF.TextAnalysis(this.makeText);
        this.dx = rdx;
        this.dy = rdy;
        this.isDrawAll = false;
        color = data.msgText.textColor;
        this.speed = tempSpeed;
        this.speedTmp = this.speed;
        this.talkDraw.visible = true;
        this.isNext = false;

    };



    /**
     * 对话框出现
     */
    this.fadeIn = function(){
        if(!isInit) return;
        if(_sf.haveTextBox){
            this.talkBack.visible = setB;
            this.talkDraw.visible = true;
        }else{
            this.talkBack.visible = false;
            this.talkDraw.visible = false;
        }
        if(_sf.haveNameBox){
            this.nameBack.visible = setB;
            this.nameDraw.visible = true;
        }else{
            this.nameBack.visible = false;
            this.nameDraw.visible = false;
        }

        if(face != null){
            face.visible = true;
        }
        if(setB){
            _sf.buttonSkip.visible = data.buttonJump.isVisible;
            _sf.buttonAuto.visible = data.buttonAuto.isVisible;
            _sf.buttonMenu.visible = RV.GameData.playCGIndex == -1 ? data.buttonMenu.isVisible:false;
        }else{
            this.buttonSkip.visible = setB;
            this.buttonAuto.visible = setB;
            this.buttonMenu.visible = RV.GameData.playCGIndex == -1 ? setB:false;
        }
        isFadeOut = false;
    };

    /**
     * 文字正则提取
     * @param mainText 需要提取的字符串
     * @param s 前置特殊标志
     * @param e 后置特殊标志
     * @param rex 正则表达式
     * @returns {*[]} 提取后的内容
     */
    function TextToTemp( mainText, s, e, rex){
        var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
        mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
        var temp1 = tmp.replaceAll(rex, "$1");
        var temp_2 = temp1.replaceAll(" ", "");
        var temp_e = temp_2.replaceAll("，", ",");
        return [temp_e,mainText];
    }

    /**
     * 释放
     */
    this.dispose = function(){
        this.pt.disposeMin();
        this.nameBack.dispose();
        this.nameDraw.dispose();
        this.talkBack.dispose();
        this.talkDraw.dispose();
        this.viewport.dispose();
        this.buttonSkip.disposeMin();
        this.buttonAuto.disposeMin();
        this.buttonMenu.disposeMin();
    };

    /**
     * 设置z坐标
     * @param z
     */
    this.setZ = function(z){
        this.viewport.z = z;
    };

}/**
 * Created by 七夕小雨 on 2019/4/8.
 * 粒子动画
 * @param res 资源ID
 * @param view 视窗
 * @param isSingle 是否播放一遍
 * @param actor 相对Actor
 * @param rect 相对Rect
 * @constructor
 */
function LParticle(res,view,isSingle,actor,rect,id){
    var _sf = this;
    //相对运动区域
    this.userRect = rect;
    //数据
    var data = res;
    var type = data.launchType;

    //资源读取
    var bitmaps = [];
    for(var i = 0;i<data.files.length;i++){
        bitmaps[i] = RF.LoadCache("Animation/" + data.files[i]);
    }
    //粒子数量
    var num = data.number;
    this.line = data.distance;
    this.dir = data.dir;

    //粒子区域
    if(type == 1){
        this.rect = new IRect(rect.left + 5, rect.top + 5, rect.left + data.width + 5, rect.top + data.height + 5);
        this.userRect = this.rect;
    }else{
        this.rect = new IRect(0, 0, data.width, data.height);
    }
    this.radii = data.radius;
    this.x = 0;
    this.y = 0;
    //重力
    this.isG = data.isGravity;
    //结束回调
    this.endDo = null;
    this.tag   = null;

    var playOne = isSingle;
    var endPlay = false;



    var time = data.time;
    var pos = 0;
    var sprites = [];
    if(bitmaps.length > 0){
        sprites = new Array(num);
        for (i = 0; i < num; i++) {
            if(bitmaps[pos] != null) {
                sprites[i] = new ISprite( bitmaps[pos] , view);
                sprites[i].x = this.rect.left + rand(0, this.rect.width);
                sprites[i].y = this.rect.top + rand(0, this.rect.height);
                sprites[i].z = 12 + id;
                sprites[i].opacity = 0;
                pos = i % bitmaps.length;
            }
        }
    }


    data.sound.play();

    /**
     * 主循环
     */
    this.update = function() {
        if (sprites == null) return;
        if(data.point.type == 0){
            this.pointUpdate();
        }
        var noneCount = 0;
        for (var i = 0; i < sprites.length; i++) {
            if (sprites[i] == null) continue;
            if (sprites[i].opacity > 0) {
                if(sprites[i].tag == null) {
                    sprites[i].opacity = 0;
                    return;
                }else {
                    var temp = sprites[i].tag;
                    sprites[i].opacity -= temp[0];
                    sprites[i].x += temp[1];
                    sprites[i].y += temp[2];
                    if (this.isG) {
                        temp[2] += 0.1;
                    }
                }
            } else {
                if(sprites[i].tag != null && sprites[i].opacity <= 0 && playOne) {
                    noneCount += 1;
                    continue;
                }
                if (type == 1) {
                    var ftime = (time / 2) + rand(0, time);
                    sprites[i].opacity = 1.0;
                    var difO = 1.0 / (ftime * 1.0);

                    var difX = 0;
                    var difY = 0;
                    sprites[i].x = this.rect.left + rand(0, this.rect.width);
                    sprites[i].y = this.rect.top + rand(0, this.rect.height);
                    sprites[i].zoomX = sprites[i].zoomY = 1.0 - 0.5 * Math.random();
                    switch (this.dir) {
                        case 0:
                            difY = ((sprites[i].y - this.line) - sprites[i].y) / (ftime * 1.0);
                            break;
                        case 1:
                            difY = ((sprites[i].y + this.line) - sprites[i].y) / (ftime * 1.0);
                            break;
                        case 2:
                            difX = ((sprites[i].x - this.line) - sprites[i].x) / (ftime * 1.0);
                            break;
                        case 3:
                            difX = ((sprites[i].x + this.line) - sprites[i].x) / (ftime * 1.0);
                            break;
                    }
                    sprites[i].tag = [difO, difX, difY];
                } else if (type == 0) {
                    var d = rand(0, 360);
                    var angle = Math.PI * (d * 1.0) / 180.0;
                    var endX = this.x + parseInt(Math.cos(angle) * this.radii);
                    var endY = this.y + parseInt(Math.sin(angle) * this.radii);
                    sprites[i].opacity = 1.0;
                    sprites[i].angle = rand(0, 360);
                    ftime = (time / 2) + rand(0, time);

                    difO = 1.0 / (ftime * 1.0);
                    difX = (endX - this.x) / (ftime * 1.0);
                    difY = (endY - this.y) / (ftime * 1.0);
                    sprites[i].x = this.x;
                    sprites[i].y = this.y;
                    sprites[i].zoomX = sprites[i].zoomY = 1.0 - 0.* Math.random();
                    sprites[i].tag = [ difO, difX, difY ];
                }
            }
        }
        if(noneCount >= sprites.length - 1 && playOne && this.endDo != null){
            this.endDo();
            this.endDo = null;
        }

    };

    /**
     * 坐标刷新
     */
    this.pointUpdate = function(){
        var x = 0;
        var y = 0;
        var point = data.point;
        if(point.type === 0){//相对坐标

            var rect = null;
            if(actor != null){
                rect = actor.getUserRect();
            }else if(_sf.userRect != null){
                rect = _sf.userRect;
            }else{
                rect = new IRect(1,1,1,1);
            }

            if(point.dir === 0){//中心
                x = rect.x + rect.width / 2;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 1){//上
                x = rect.x + rect.width / 2;
                y = rect.y;
            }else if(point.dir === 2){//下
                x = rect.x + rect.width / 2;
                y = rect.bottom;
            }else if(point.dir === 3){//左
                x = rect.x;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 4){//右
                x = rect.right;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 5){//画面
                x = 0;
                y = 0;
            }

        }else{//绝对坐标
            x = point.x;
            y = point.y;
        }
        if(type === 0){
            this.x = x;
            this.y = y;

        }else{
            var w = this.rect.width;
            var h = this.rect.height;
            this.rect.left = x - w / 2 ;
            this.rect.top = y - h / 2 ;
            this.rect.right = this.rect.left + w;
            this.rect.bottom = this.rect.top + h;
        }

    };

    this.pointUpdate();

    /**
     * 释放
     */
    this.dispose = function(){
        if(sprites == null) return;
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].disposeMin();
        }
        sprites = null;
    };

    /**
     * 获得矩形
     * @returns {IRect}
     */
    this.getRect = function(){
        return new IRect(this.x,this.y,1,1);
    }



}/**
 * Created by 七夕小雨 on 2018-2-9.
 * 特殊天气粒子效果
 * @param bmps 粒子图片
 * @param num 粒子数量
 * @param z z图层
 * @param vp 视窗
 */
function LPetal(bmps, num, z, vp){
    var sps = [];

    if(bmps.length <= 0) return;
    for (var i = 0; i < num; i++) {
        sps[i] = new ISprite(bmps[rand(0,bmps.length - 1)]);
        sps[i].z = z + i;
        sps[i].zoomX = sps[i].zoomY = 0.1 + (0.2 * (rand(0,100) * 1.0 / 100.0));
        sps[i].x = -50 - rand(0,RV.NowProject.gameWidth);
        sps[i].y = -100 + rand(0,150);
        sps[i].startRotate((rand(0,100) * 1.0 / 100.0));
        sps[i].tag = [20+rand(0,200),10+rand(0,100)];
    }

    this.update = function(){
        for (var i = 0; i < sps.length; i++) {
            var speed = sps[i].tag;
            var speedx = speed[0] * 1.0 / 100;
            var speedy = speed[1] * 1.0 / 100;
            sps[i].x += speedx;
            sps[i].y += speedy;
            if(sps[i].x > RV.NowProject.gameWidth || sps[i].y > RV.NowProject.gameHeight){
                sps[i].zoomX = sps[i].zoomY = 0.1 + (0.2 * (rand(0,100) * 1.0 / 100.0));
                sps[i].x = -50 - rand(0,RV.NowProject.gameWidth);
                sps[i].y = -100 + rand(0,150);
                sps[i].startRotate((rand(0,100) * 1.0 / 100.0));
                sps[i].tag = [20+rand(0,200),10+rand(0,100)];
            }
        }
    };

    this.dispose = function(){
        for (var i = 0; i < sps.length; i++) {
            sps[i].disposeMin();
        }
    }
}

LPetal.Play = function(bmps, zoomMin, zoomMax, time){
    var num = 40;
    for (var i = 0; i < num; i++) {
        if(LPetal.disSps[i] == null){
            LPetal.disSps[i] = new ISprite(bmps[rand(0,bmps.length)]);
            LPetal.disSps[i].z = 99999 + i;
        }
        LPetal.disSps[i].zoomX = LPetal.disSps[i].zoomY = zoomMin + (zoomMax * (rand(0,100) * 1.0 / 100.0));
        LPetal.disSps[i].x = -50 - rand(0,300);
        LPetal.disSps[i].y = rand(0,300);
        LPetal.disSps[i].startRotate((rand(0,100) * 1.0 / 100.0));
        var endy = rand(0,800);
        var timeNew =  (time + time * rand(0,300) / 100.0);
        LPetal.disSps[i].slideTo(550, endy,timeNew);
        LPetal.disSps[i].scaleTo(LPetal.disSps[i].zoomX * 0.5, LPetal.disSps[i].zoomX * 0.5, timeNew);
    }
};

LPetal.disSps = [];
/**
 * Created by 七夕小雨 on 2018-2-26.
 * 天气处理
 */
function LWeather(){
    //天气类型
    var type;
    //当前天气图片
    var bitmap;
    //天气粒子
    var particle;
    var rb,sb,pb,lb;
    var null_bitmap;
    var petal;

    bitmap = null;
    type = 0;
    null_bitmap = IBitmap.CBitmap(10, 10);

    /**
     * 初始化雨的图片
     */
    function rain_init(){
        rb = [RF.LoadBitmap("System/Weather/rain.png")];
    }

    /**
     * 初始化雪的图片
     */
    function snow_init(){
        sb =[RF.LoadBitmap("System/Weather/snow.png")];
    }

    /**
     * 花瓣
     */
    function petal_init(){
        pb = [
            RF.LoadBitmap("System/Weather/petal_0.png"),
            RF.LoadBitmap("System/Weather/petal_1.png"),
            RF.LoadBitmap("System/Weather/petal_2.png")];
    }

    /**
     * 落叶
     */
    function leaf_init(){
        lb =[RF.LoadBitmap("System/Weather/leaf.png")];
    }

    /**
     * 设置天气
     * @param ptype
     */
    this.setWeatherType = function(ptype){
        var max = 10;
        var time =60;
        type = ptype;
        if(type<=0 || type>4){
            type = 0;
            bitmap = null;
            if(petal != null){
                petal.dispose();
            }
            particle.changeParticle([null_bitmap], 0, 1, 0, null);
        }else{
            if(type == 1){
                max = 60;
                time = 60;
                particle.dir = 1;
                particle.line = RV.NowProject.gameHeight;
                bitmap = rb;
            }else if(type == 2){
                bitmap = sb;
                max = 20;
                time = 120;
                particle.line = RV.NowProject.gameHeight;
                particle.dir = 1;
            }else if(type == 3){
                bitmap = null;
                if(petal != null){
                    petal.dispose();
                }
                petal = new LPetal(pb , 20, 1050, null);
            }else if(type == 4){
                bitmap = null;
                if(petal != null){
                    petal.dispose();
                }
                petal = new LPetal(lb , 20, 1050, null);
            }else{
                bitmap = null;
            }
            if(bitmap != null){
                if(petal != null){
                    petal.dispose();
                }
                particle.changeParticle(bitmap, max, time, 0, null);
                particle.z = 1050;
            }else{
                particle.changeParticle([null_bitmap], 0, 1, 0, null);
            }

        }
    };

    /**
     * 天气对象初始化
     */
    this.init = function() {
        petal_init();
        leaf_init();
        snow_init();
        rain_init();
        particle  = new IParticle([null_bitmap], 0, 1, 0, null);
        particle.rect = new IRect(0, 0, RV.NowProject.gameWidth, RV.NowProject.gameHeight);
        particle.z = 1050;
    };

    /**
     * 主循环
     */
    this.update = function() {
        if(type >= 0){
            if(particle != null){
                particle.update();
            }
            if(petal != null){
                petal.update();
            }
        }
    };

    /**
     * 释放
     */
    this.dispose = function() {
        if(particle != null){
            null_bitmap = null;
            rb = null;
            sb = null;
            lb = null;
            particle.dispose();
            particle = null;
        }
        if(petal != null){
            petal.dispose();
        }
    }

}/**
 * Created by 七夕小雨 on 2019/3/17.
 * 通用控制部分
 */
function RC(){}

//默认按键配置
RC.Key = {
    up        : 38,
    down      : 40,
    left      : 37,
    right     : 39,
    skip      : 16,
    auto      : 65,
    cancel    : 27
};

RC.IsKeyOK = function(){
    return IInput.isKeyDown(32) || IInput.isKeyDown(13)
};

/**
 * 输入按键code获得对应字符串
 * @param code
 * @returns string
 */
RC.CodeToSting = function(code) {
    switch (code) {
        case 8:
            return "Back";
        case 9:
            return "Tab";
        case 12:
            return "Clear";
        case 13:
            return "Ent";
        case 16:
            return "Shift";
        case 17:
            return "Ctrl";
        case 18:
            return "Alt";
        case 19:
            return "Pause";
        case 20:
            return "Caps";
        case 27:
            return "Esc";
        case 32:
            return "Space";
        case 33:
            return "Prior";
        case 34:
            return "Next";
        case 35:
            return "End";
        case 36:
            return "Home";
        case 37:
            return "Left";
        case 38:
            return "Up";
        case 39:
            return "Right";
        case 40:
            return "Down";
        case 41:
            return "Select";
        case 42:
            return "Print";
        case 43:
            return "Execute";
        case 45:
            return "Ins";
        case 46:
            return "Del";
        case 47:
            return "Help";
        case 48:
            return "0";
        case 49:
            return "1";
        case 50:
            return "2";
        case 51:
            return "3";
        case 52:
            return "4";
        case 53:
            return "5";
        case 54:
            return "6";
        case 55:
            return "7";
        case 56:
            return "8";
        case 57:
            return "9";
        case 65:
            return "A";
        case 66:
            return "B";
        case 67:
            return "C";
        case 68:
            return "D";
        case 69:
            return "E";
        case 70:
            return "F";
        case 71:
            return "G";
        case 72:
            return "H";
        case 73:
            return "I";
        case 74:
            return "J";
        case 75:
            return "K";
        case 76:
            return "L";
        case 77:
            return "M";
        case 78:
            return "N";
        case 79:
            return "O";
        case 80:
            return "P";
        case 81:
            return "Q";
        case 82:
            return "R";
        case 83:
            return "S";
        case 84:
            return "T";
        case 85:
            return "U";
        case 86:
            return "V";
        case 87:
            return "W";
        case 88:
            return "X";
        case 89:
            return "Y";
        case 90:
            return "Z";
        case 96:
            return "Kp0";
        case 97:
            return "Kp1";
        case 98:
            return "Kp2";
        case 99:
            return "Kp3";
        case 100:
            return "Kp4";
        case 101:
            return "Kp5";
        case 102:
            return "Kp6";
        case 103:
            return "Kp7";
        case 104:
            return "Kp8";
        case 105:
            return "Kp9";
        case 106:
            return "Kp*";
        case 107:
            return "Kp+";
        case 108:
            return "KpEnt";
        case 109:
            return "Kp-";
        case 110:
            return "Kp.";
        case 111:
            return "Kp/";
        case 112:
            return "F1";
        case 113:
            return "F2";
        case 114:
            return "F3";
        case 115:
            return "F4";
        case 116:
            return "F5";
        case 117:
            return "F6";
        case 118:
            return "F7";
        case 119:
            return "F8";
        case 120:
            return "F9";
        case 121:
            return "F10";
        case 122:
            return "F11";
        case 123:
            return "F12";
        case 187:
            return "+";
        case 189:
            return "_";
        case 219:
            return "{";
        case 221:
            return "}";
        case 220:
            return "\\";
        case 186:
            return ";";
        case 222:
            return "\"";
        case 188:
            return "<";
        case 190:
            return ">";
        case 191:
            return "/";
        case 192:
            return "~";
        default:
            return "无效";
    }
};/**
 * Created by 七夕小雨 on 2019/1/3.
 * 通用函数
 */
function RF(){}

/**
 * 游戏结束
 */
RF.GameOver = function(){
    if(IVal.scene instanceof SMain){
        var ui =  RV.NowUI.uis[9];
        IVal.scene.initSelfUI(ui,"");
    }
};
/**
 * 游戏胜利
 */
RF.GameWin = function(){
    if(IVal.scene instanceof  SMain){
        var ui =  RV.NowUI.uis[10];
        IVal.scene.initSelfUI(ui,"");
    }
};
/**
 * 游戏菜单
 */
RF.GameMenu = function(){
    if(IVal.scene instanceof SMain){
        IVal.scene.setDialog(new WMenu(),
            function(menu){
                if(menu == "loadGame"){
                    RF.LoadGame();
                }else if(menu == "backTitle"){
                    IVal.scene.dispose();
                    IAudio.BGMFade(2);
                    IAudio.BGSFade(2);
                    IVal.scene = new STitle();
                }
            });
    }
};
/**
 * 读取图片
 * @param path 图片地址
 */
RF.LoadBitmap = function(path){
    return IBitmap.WBitmap("Graphics/" + path);
};

/**
 * 读取缓存
 * @param path 图片地址
 * @param func 读取完毕后回调
 * @param tag 读取过程中tag
 * @returns {*} 缓存中图片
 */
RF.LoadCache = function(path,func,tag){
    if(RV.Cache[path] == null){
        RV.Cache[path] = RF.LoadBitmap(path);
        RV.Cache[path].loadTexture();
        if(RV.Cache[path].complete){
            if(func != null) func(RV.Cache[path],tag)
        }else if(func != null){
            RV.Cache[path].onload = function(){
                func(RV.Cache[path],tag);
            };
            RV.Cache[path].onerror = function(){
                func(null,tag);
            };
        }
        return RV.Cache[path];
    }else{
        if(func != null){
            if(func != null) func(RV.Cache[path],tag);
        }
        return RV.Cache[path];
    }
};


/**
 * 预加载UI资源
 * @param fileAry 文件数组
 * @param loadOver 加载完毕后回调 function(ary)
 */
RF.CacheUIRes = function(fileAry,loadOver){
    var index = 0;
    var hash = {};
    if(fileAry.length == 0){
        loadOver([]);
        return;
    }
    for(var i = 0;i<fileAry.length;i++){
        var bitmap = RF.LoadBitmap(fileAry[i]);
        hash[fileAry[i]] = bitmap;
    }
    for(var key in hash){
        bitmap = hash[key];
        if(bitmap.complete){
            index += 1;
            if(index >= Object.keys(hash).length){
                loadOver(hash)
            }
        }else{
            bitmap.onload = function(){
                index += 1;
                if(index >= Object.keys(hash).length){
                    loadOver(hash)
                }
            };
            bitmap.onerror = function(){
                index += 1;
                if(index >= Object.keys(hash).length){
                    loadOver(hash)
                }
            };
        }
    }
};


/**
 *获得时间数字
 * @param s
 * @returns {string}
 * @constructor
 */
RF.MakerTime = function(s){
    var hour = 0;
    var min = 0;
    var sec = 0;
    if(s >= 3600){
        hour = parseInt(s / 3600);
        if(hour < 10) hour = "0"+ parseInt(s / 3600);
        min = (parseInt(s / 60) % 60);
        if(min < 10) min = "0"+ (parseInt(s / 60) % 60);
        sec = parseInt(s % 60);
        if(sec < 10) sec = "0"+ parseInt(s % 60);
    }else if(s >= 60){
        hour = "00";
        min = parseInt(s / 60);
        if(min < 10) min = "0"+ parseInt(s / 60);
        sec = parseInt(s % 60);
        if(sec < 10) sec = "0"+ parseInt(s % 60);
    }else{
        hour = "00";
        min = "00";
        sec = s;
        if(sec < 10) sec = "0"+ s;
    }
    return hour + ":" + min + ":" + sec;
};
/**
 * 获得时间戳
 * @constructor
 */
RF.GetTime = function(){
    var time = Number(new Date());
    return parseInt(time / 1000);
};

/**
 * 绘制连续窗口
 * @param fbmp 目标Sprite
 * @param bmp  资源bitmap
 * @param w    窗口宽度
 * @param h    窗口高度
 * @param x    窗口x偏移
 * @param y    窗口y偏移
 * @param l    单位格尺寸（保证正方形）;
 */
RF.DrawFrame = function( fbmp, bmp,  w, h, x, y , l){
    var width = w;
    var height = h;

    var g = fbmp;

    var lt = l;

    //四个边
    g.drawBitmap(bmp[0], x, y);
    g.drawBitmap(bmp[2], x + width - lt, y);
    g.drawBitmap(bmp[5], x, y + height - lt);
    g.drawBitmap(bmp[7], x + width - lt, y + height - lt);
    //计算长宽
    width = width - lt - lt;
    height = height- lt - lt;

    g.drawBitmapRect(bmp[1], new IRect(x + lt,y, x + lt + width , y + lt),false);//上
    g.drawBitmapRect(bmp[3], new IRect(x,y + lt,x + lt,y + lt + height),false);//左
    g.drawBitmapRect(bmp[6], new IRect(x + lt, y + height + lt, x + lt + width,y + height + lt + lt),false);//下
    g.drawBitmapRect(bmp[4], new IRect(x + width + lt , y + lt,x + width + lt + lt,y + lt + height),false);//右
    g.drawBitmapRect(bmp[8], new IRect(x + lt,y + lt,x + lt +width,y + lt+height),false);//肚子

};

/**
 * 是否按下继续建
 * @returns {boolean}
 */
RF.IsNext = function(){
    return IInput.up || IInput.isKeyDown(13) || IInput.isKeyDown(32);
};
/**
 * 默认颜色 0号
 * @returns {IColor}
 */
RF.C0 = function(){
    return IColor.White();
};

/**
 * 显示tips
 * @param m tips 内容
 */
RF.ShowTips = function(m){
    if(IVal.scene instanceof SMain == false) return;
    var main =IVal.scene.getMainUI();
    var back = main.tipBack;
    var text = main.tipText;
    LUI.setText(text,RF.MakerValueText(m));
    back.width = text.width + text.data.x * 2;
    back.height = text.height + text.data.y * 2;
    var r = LUI.getCtrlRect(back.data,main.ctrlItems,0,0);
    var r1 = back.GetRect();
    var endX = r.x + DUI.HPoint(back.data.x,back.data.HAlign, r.width, r1.width);
    var endY = r.y + DUI.VPoint(back.data.y,back.data.VAlign, r.height,r1.height);
    back.x = endX;
    back.y = endY;
    text.x = back.x + text.data.x;
    text.y = back.y + text.data.y;
    back.opacity = 1;
    text.opacity = 1;
    back.pauseAnim();
    text.pauseAnim();
    back.addAction(action.wait,60 + m.length * 4);
    back.addAction(action.fade,1,0,60);
    text.addAction(action.wait,60 + m.length * 4);
    text.addAction(action.fade,1,0,60);
};

/**
 * 关键字符串转译为“空”
 * @param str
 * @returns {String}
 */
RF.TextAnalysisNull = function(str){
    var s = new String(str);
    s = ISprite.toRegular(s);
    s = s.replaceAll("\\r\\n", "\\n");
    s = s.replaceAll("\\\\[Nn]", RF.CharToAScII(60000));
    s = s.replaceAll("\\\\[Cc]\\[([0-9]+,[0-9]+,[0-9]+)]", "");
    s = s.replaceAll("\\\\[Ss]\\[([0-9]+)]", "");
    s = s.replaceAll("\\\\[Pp]", "");
    s = s.replaceAll("\\\\[Ww]\\[([0-9]+)]", "");
    s = s.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]","  ");
    s = s.replaceAll("\\\\cd", "");
    s = s.replaceAll("\\\\ck", "");
    s = s.replaceAll("\\\\=", "");
    s = s.replaceAll("\\\\>", "");
    s = s.replaceAll("\\\\~", "");
    s = s.replaceAll("\\\\\\|", "");
    return s;
};
/**
 * 字符串转译为关键编码
 * @param str
 * @returns {String}
 * @constructor
 */
RF.TextAnalysis = function(str){
    var s = new String(str);
    s = ISprite.toRegular(s);
    s = s.replaceAll("\\r\\n", "\\n");
    s = s.replaceAll("\\\\[Nn]", RF.CharToAScII(60000));
    s = s.replaceAll("\\\\[Cc]\\[([0-9]+,[0-9]+,[0-9]+)]",RF. CharToAScII(60001) + "[$1]");
    s = s.replaceAll("\\\\[Ss]\\[([0-9]+)]", RF.CharToAScII(60002) + "[$1]");
    s = s.replaceAll("\\\\[Pp]", RF.CharToAScII(60100));
    s = s.replaceAll("\\\\[Ww]\\[([0-9]+)]", RF.CharToAScII(60104) + "[$1]");
    s = s.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",RF.CharToAScII(60003) +"[$1]");
    s = s.replaceAll("\\\\>", RF.CharToAScII(60105));
    s = s.replaceAll("\\\\=", RF.CharToAScII(60106));
    s = s.replaceAll("\\\\~", RF.CharToAScII(60101));
    s = s.replaceAll("\\\\\\|", RF.CharToAScII(60103));
    return s;
};

/**
 * iFAction 坐标字符转译
 * @param win 窗口
 * @param self 要计算坐标的对象 // 若 value为数字可缺省
 * @param value 字符串或固定值
 * @param xy x方向或y方向 // 若 value为数字可缺省
 * @returns Number
 */
RF.PointTranslation = function(win,self,value,xy){
    if(typeof(value)=='string'){
        var tag = value.split("_");
        var obj = tag[0];
        var alignment = tag[1];
        var deviation =  parseInt(tag[2]);
        var val = 0;
        var val2 = 0;
        var vars = 0;
        if(obj == "scene"){
            if(xy == "x"){
                val = IVal.GWidth;
                vars = self.width;
            }else{
                val = IVal.GHeight;
                vars = self.height;
            }
        }else{
            try{
                if(xy == "x"){
                    val = win.getEval(obj + ".width");
                    val2 = win.getEval(obj + ".x");
                    vars = self.width;
                }else{
                    val = win.getEval(obj + ".height");
                    val2 = win.getEval(obj + ".y");
                    vars = self.height;
                }
            }catch(e){ return 0}

        }
        if(alignment == "left" || alignment == "top"){
            return val2 + deviation;
        }else if(alignment == "center"){
            return (val2 + (val - vars) / 2) + deviation;
        }else if(alignment == "right" || alignment == "bottom"){
            return (val2 + val - vars) + deviation;
        }

    }else{
        return value;
    }
};




/**
 * 对数组的值进行随机选择
 * @param ary
 * @returns {null|*}
 * @constructor
 */
RF.RandomChoose = function(ary){
    if(ary == null || ary.length <= 0){
        return null;
    }
    return ary[Math.floor(Math.random() * ary.length)];
};
/**
 * 指定概率是否达成
 * @param rate 概率 浮点
 * @returns {boolean}
 */
RF.ProbabilityHit = function(rate){
    return rate >  Math.random();
};
/**
 * 字符串转换AscII
 * @param num
 * @returns {string}
 */
RF.CharToAScII = function(num) {
    return String.fromCharCode(num);
};
/**
 * 保存游戏
 */
RF.SaveGame = function(){
    RV.SaveInfo.save(0);
    // RF.ShowTips("已自动保存");
};
/**
 * 读取游戏
 */
RF.LoadGame = function(index){
    IAudio.BGMFade(2);
    if(IVal.scene != null) IVal.scene.dispose();
    if(RV.GameData == null) RV.GameData = new GMain();
    if(GMain.haveFile(index)){
        RV.GameData.load(index);
    }else{
        RV.GameData.init();
    }
    RV.InterpreterOther = [];
    if(RV.NowSet != null) {
        IVal.scene = new SMain();
        RV.InterpreterMain.load( RV.GameData.storySelectInfo,RV.GameData.iIndex,RV.GameData.ievent);
        RV.NowCanvas.load();
    }
};


RF.AddOtherEvent = function(events,tag,id){
    var doEvent = new IMain();
    doEvent.addEvents(events);
    doEvent.tag = tag;
    doEvent.NowEventId = id;
    RV.InterpreterOther.push(doEvent);
};

RF.FindOtherEvent = function(tag){
    for(var i = 0;i<RV.InterpreterOther.length;i++){
        if(RV.InterpreterOther[i].tag == tag){
            return RV.InterpreterOther[i];
        }
    }
    return null;
};

RF.CheckLanguage = function(str){
    var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u3040-\\u309F\\u30A0-\\u30FF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u0E00-\\u0E7F]+","g");
    if(reg.test(str)){
        return true;
    }
    return false;
};

RF.MakerValueText = function(str){
    if(str != null){
        var s = str.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",RF.CharToAScII(60003)+  "[$1]");
        var end = "";
        while(true){
            if(s.length <= 0){
                break;
            }
            var min = s.substring(0,1);
            s = s.substring(1,s.length);
            var c = min.charCodeAt(0);
            if(c == 60003){
                var returnS = RF.TextToTemp(s , "[","]","\\[([a-zA-Z0-9-_]+)]");
                s = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else{
                end += min;
            }
        }
        return end;
    }
    return "";
};

RF.TextToTemp = function( mainText, s, e, rex){
    var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
    mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
    var temp1 = tmp.replaceAll(rex, "$1");
    var temp_2 = temp1.replaceAll(" ", "");
    var temp_e = temp_2.replaceAll("，", ",");
    return [temp_e,mainText];
};

RF.getDate = function (time) {
    var now = new Date(time * 1000),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
};/**
 * Created by 七夕小雨 on 2019/1/3.
 * 全局变量
 */
function RV(){}

//游戏平台
RV.Platform = "PC";//PC Andoir iOS Web WP WeiXin
//游戏当前工程数据
RV.NowProject = null;
//游戏当前资源数据
RV.NowRes = null;
//游戏当前设置数据
RV.NowSet = null;
//游戏UI
RV.NowUI = null;

//游戏当前地图
RV.NowMap = null;
//游戏当前舞台
RV.NowCanvas = null;
//当前执行的触发器ID
RV.NowEventId = -1;
//提示框缓存图片
RV.ToastPics = [];
//伤害数字缓存图片
RV.NumberPics = [];

//游戏数据
RV.GameData = null;
//设置数据
RV.GameSet = null;

//主解释器
RV.InterpreterMain = null;
//异步解释器
RV.InterpreterOther = [];
//角色是否死亡
RV.IsDie = false;

//存档列表
RV.SaveInfo = null;

//事件读取
RV.isLoad = false;
//缓存
RV.Cache = [];



/**
 * Created by 七夕小雨 on 2019/1/3.
 * 游戏主场景
 */
function SMain(){
    var _sf = this;
    //==================================== 界面坐标 ===================================
    /**
     * 暴露私有变量
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== 私有属性 ===================================
    //主界面对象
    var mainUI = null;
    //菜单界面ID
    var uiMenuID = RV.NowSet.setAll.Menuid;

    RV.InterpreterMain = new IMain();
    var story = RV.NowProject.findMap(RV.GameData.storyId);
    RV.InterpreterMain.addEvents(story.events);
    //生成画布舞台
    var display = new LCanvas();
    //阻塞主线程执行的窗口
    var dialog = null;
    //不阻塞主线程执行的异步内容
    var dialogParallel = {};
    //预加载判断变量
    var loadOver = true;
    var dieWait = -1;

    //自定义UI
    var selfUIMain = null;
    var selfUIOther = [];


    //==================================== 公有函数 ===================================
    /**
     * 主刷新
     */
    this.update = function(){
        if(!loadOver || !display.isInit()) return true;
        if(dialog != null && dialog.update()) return true;
        for(var key in dialogParallel){
            dialogParallel[key].update();
        }
        if(selfUIMain != null && selfUIMain.updateUI()) return true;
        for(var i = 0;i< selfUIOther.length;i++){
            selfUIOther[i].updateUI();
        }
        if(updateMenu()) return true;
        initAutoSelfUI();
        if(IVal.scene != this) return true;
        if(display.update()) return true;
        doInterpreterOther();
        if(RV.InterpreterMain.update()) return true;
        //通用触发器刷新
        for(var eid in RV.NowSet.setEvent){
            if(RV.NowSet.setEvent[eid].autoRun){
                RV.NowSet.setEvent[eid].doEvent();
            }
        }

        if(RV.isLoad){
            RV.isLoad = false;
            RF.LoadGame();
        }
    };

    function updateMenu(){
        //通过菜单界面操作指令呼叫对应的菜单
        if(RV.GameData.menu == -1){
             RV.NowCanvas.message.waitEnd = 0;
            _sf.callMenu(uiMenuID);
            RV.GameData.menu = 0;
            return true;
        }else if(RV.GameData.menu > 0){
             RV.NowCanvas.message.waitEnd = 0;
            _sf.callMenu(RV.GameData.menu);
            if(RV.GameData.menu != uiMenuID) {
                RV.GameData.menu = -1;
            }else{
                RV.GameData.menu = 0;
            }
            return true;
        }
        //取消键激活菜单或退出cg鉴赏
        if(IInput.isKeyDown(RC.Key.cancel)){
            if(RV.GameData.playCGIndex != -1){
                RV.GameData.jumpTime = 0;
                IVal.scene.dispose();
                IVal.scene = new STitle();
            }else{
                RV.GameSet.playEnterSE();
                RV.NowCanvas.message.isClick = true;
                RV.GameData.menu = -1;
                //_sf.callMenu(uiMenuID);
                IInput.keyCodeAry = [];
            }
            return true;
        }
        return false;
    }

    //执行异步事件集合队列
    function doInterpreterOther(){
        for(var i = RV.InterpreterOther.length - 1 ; i>= 0 ; i--){
            RV.InterpreterOther[i].update();
            if(RV.InterpreterOther[i].isEnd){
                RV.InterpreterOther.remove(RV.InterpreterOther[i]);
            }
        }
    }

    /**
     * 主释放
     */
    this.dispose = function(){
        if(selfUIMain != null){
            selfUIMain.disposeAll();
            selfUIMain = null;
        }
        for(var i = 0;i< selfUIOther.length;i++){
            selfUIOther[i].disposeAll();
        }
        if(dialog != null){
            dialog.dispose();
            dialog = null;
        }
        for(var key in dialogParallel){
            dialogParallel[key].dispose();
        }
        dialogParallel = {};
        display.dispose();
    };

    /**
     * 设置模态对话框
     * @param dl 对话框
     * @param endFuc 窗体结束后回调
     */
    this.setDialog = function(dl,endFuc){
        dialog = dl;
        if(dialog != null){
            dialog.endDo = function(obj){
                endFuc(obj);
                dialog = null;
            }
        }

    };
    /**
     * 设置同步对话框
     * @kname 窗口识别key名称
     * @param dl 对话框
     * @param endFuc 窗口结束回调
     */
    this.setDialogParallel = function(kname,dl,endFuc){
        if(dialogParallel[kname] != null){//同名窗口释放
            dialogParallel[kname].dispose();
            delete  dialogParallel[kname];
        }
        dialogParallel[kname] = dl;
        dialogParallel[kname].endDo = function(obj){
            endFuc(obj);
            delete  dialogParallel[kname];
        }
    };

    this.getDialogParallel = function(kname){
        return dialogParallel[kname];
    };

    /**
     * 暴露私有变量，并执行
     * @param code
     */
    this.getEval = function(code){
        return eval(code);
    };

    this.getMainUI = function(){
        return mainUI;
    };

    this.getMenuId = function(){
      return uiMenuID;
    };
    this.callMenu = function(id){
        var ui =  RV.NowUI.uis[id];
        _sf.initSelfUI(ui,"");
    };

    this.initSelfUI = function(ui,args){
        if(ui != null){
            if(ui.isParallel && _sf.getSelfUI(ui.id) == null){
                var lui = new LUI(ui,args);
                lui.endDo = function(){
                    for(var i = 0;i<selfUIOther.length;i++){
                        if(selfUIOther[i] == lui){
                            selfUIOther.remove(lui);
                            break;
                        }
                    }
                };
                selfUIOther.push(lui);
                if(mainUI == null && lui.keyMake == "main"){
                    mainUI = lui;
                }
                return lui;
            }else{
                selfUIMain = new LUI(ui,args);
                selfUIMain.endDo = function(){
                    selfUIMain = null;
                };
                return selfUIMain;
            }
        }
    };

    this.getSelfUI = function(id){
        if(selfUIMain != null){
            return selfUIMain;
        }
        for(var i = 0;i<selfUIOther.length;i++){
            if(selfUIOther[i].data.id == id){
                return selfUIOther[i];
            }
        }
        return null;
    };

    function initAutoSelfUI() {
        var uis = RV.NowUI.uis;
        for (var key in uis) {
            var ui = uis[key];
            if (ui.isAutoStart && _sf.getSelfUI(ui.id) == null && ui.startIf.result()) {
                _sf.initSelfUI(ui, "");
            }
        }
    }
}/**
 * Created by 七夕小雨 on 2019/1/4.
 */
function SStart(){
    var load = 0;
    //读取工程数据
    RV.NowProject = new DProject(function(){
        load += 1;
    });
    //读取设置数据
    RV.NowSet = new DSet(function(){

        load += 1;
    });
    //读取游戏UI
    RV.NowUI = new DUI(function (){
        load += 1;
    });


    //起屏
    var logoBmp = RF.LoadBitmap("Picture/iFVN_logo.png");
    var logo = null;
    var background = null;
    var logoWait = 120;
    if(logoBmp != null){
        background = new ISprite(IVal.GWidth , IVal.GHeight,IColor.White());
        background.z = 9000;
        var w = IFont.getWidth("Powered by iFVN",18);
        background.drawTextQ("Powered by iFVN",
            IVal.GWidth - w - 10,IVal.GHeight - 30,
            IColor.CreatColor(87,87,87),18);
        logo = new ISprite(logoBmp);
        logo.z = 9010;
        logo.yx = 0.5;
        logo.yy = 0.5;
        logo.x = IVal.GWidth / 2;
        logo.y = IVal.GHeight / 2;
    }



    //主更新
    this.update = function(){
        if(logoBmp != null){
            logoWait -= 1;
            if(logoWait > 0){
                return;
            }
        }
        if(load >= 3){
        //读取设置数据
            RV.SaveInfo = new GSaveData();
            RV.SaveInfo.loadAll();
            RV.GameSet = new GSet();
            RV.GameSet.load();
            RV.InterpreterMain = new IMain();
            RV.InterpreterOther = [];
            this.dispose();
            RV.GameData = new GMain();
            load = -1;
            IVal.scene = new STitle();
        }
    };
    //释放
    this.dispose = function(){
        if(logoBmp != null){
            background.fadeTo(0,40);
            logo.fadeTo(0,40);
            background.setOnEndFade(function(){
                logo.dispose();
                background.dispose();
            });

        }
    };

}/**
 * Created by 七夕小雨 on 2020/5/7.
 */
function STitle() {
    var _sf = this;
    var ui = RV.NowUI.uis[parseInt(RV.NowSet.setAll.titleFile)];
    var selfUIMain = null;
    if(ui == null){
        throw "UI is not set for Title 未设置标题界面";
    }else{
        selfUIMain  = new LUI(ui,"");
        selfUIMain.endDo = function(){
            selfUIMain = null;
        }
    }
    this.update = function () {
        if(ui == null) return;
        if(selfUIMain != null){
            selfUIMain.updateUI();
        }
        return true
    };

    this.dispose = function(){
        selfUIMain.disposeAll();
    };
}
/**
 * Created by 七夕小雨 on 2019/1/15.
 * 游戏界面·样例
 */
function WBase(){
    //==================================== 弹出窗口（对话框）范例框架 ===================================
    /**
     * 框架说明：
     * this.endDo 为窗口结束时的回调，对象类型为function
     *
     * obj为 回调时的参数，这里变量为范例命名，可自改
     * 注意：如果使用SMain的setDialog函数或者setDialogParallel函数设置了弹出框，回调函数中只能有一个参数
     * 如果有多个返回值请设置array对象
     *
     * this.update，为对话框内容刷新，返回值为bool，如果在SMain中使用setDialog调用了对话框，返回值为true时，则会阻止主界面所有内容刷新
     * 如果在SMain中使用setDialogParallel调用了对话框，无论返回任何值，都不会阻止主界面内容刷新
     *
     * this.dispose，为对话框释放，需要手动释放，如在update中的范例——当用户按下ESC键，则调用释放窗口
     * 而在对话框释放的过程中，执行endDo函数进行回调
     *
     * 具体调用范例参见 RF.GameOver();
     */
    var _sf = this;
    //==================================== 公有属性 ===================================
    this.endDo = null;
    //==================================== 私有属性 ===================================
    var obj = 0;

    this.update = function(){
        if(IInput.isKeyDown(27)){// 按下ESC
            obj = 1;
            _sf.dispose();
            return false;
        }
        return true;
    };

    this.dispose = function(){
        if(_sf.endDo != null) _sf.endDo(obj);
    };

}/**
 * Created by YewMoon on 2020/07/14.
 * 游戏界面·收藏鉴赏
 * @param ui
 */
function WGallery(ui){
    //==================================== 私有属性 ===================================
    var _sf = this;
    var tempSelectType = 0;
    var tempSelect = 0;
    var tempObj = null;
    var oldY = 0;
    var nowOy = 0;
    var tempProgress = 0;
    var initBarY = 0;
    var oyRate = 0;
    var waitTime = 0;
    var addVolume = 0;
    var waitMax = 10;
    var stopDownMove = false;
    var stopUpMove = false;
    var isKey = false;
    //==================================== 公有属性 ===================================
    //当前选中类型 CG 0, BGM 1
    this.selectType = 0;
    //当前选中项
    this.selectIndex = 0;
    //是否BGM正在播放中
    this.inPlayBGM = false;
    //当前展示列表
    this.currentList = [];
    //全部cg列表
    this.cgList = [];
    //全部bgm列表
    this.bgmList = [];
    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function(){
        if(RV.GameData.playCGIndex != -1){
            RV.GameSet.nowBGMFile = "";
            IAudio.BGMFade(1);
            _sf.selectIndex = RV.GameData.playCGIndex;
            RV.GameData.playCGIndex = -1;
        }
        if(RV.GameData.playBGMIndex > -1)_sf.inPlayBGM = true;
        filterOwnGallery();
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        initBarY = oldY = _sf.barScroll.y;
        _sf.updateFile(_sf.fileBag.ctrlItems[_sf.selectIndex],_sf.fileBag.ctrlItems[_sf.selectIndex].obj);
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 更新滚动条移动
     */
    this.updateOffset = function(){
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        var now = (IInput.y - 20) -  _sf.regionScroll.y;
        tempProgress = now / max;
        if(tempProgress > 1) tempProgress = 1;
        if(tempProgress < 0) tempProgress = 0;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
        _sf.updateVolume(_sf.barScroll , tempProgress);

    };
    /**
     * 更新视窗移动
     */
    this.updateVolume = function(ctrl,num){
        var maxHeight = _sf.fileBag.ctrlItems.length * _sf.fileBag.data.dy;
        if(maxHeight > _sf.viewportFile.height){
            _sf.viewportFile.oy = -(num * (maxHeight - _sf.viewportFile.height)) ;
        }else{
            _sf.viewportFile.oy = -(num * 10) ;
        }
    };
    /**
     * 本界面更新
     */
    this.update = function(){
        if((_sf.currentStep == 3 && IInput.up) || (_sf.currentStep == 3 && RC.IsKeyOK())){
            IInput.up = false;
            _sf.currentStep = 4;
            return true;
        }
        //updatePCKey();
        rotateCD();

        return true;
    };
    /**
     * 开始播放
     */
    this.updatePlay = function(){
        RV.GameSet.playEnterSE();
        if(_sf.currentStep == 4){
            _sf.currentStep = 3;
            return
        }
        if(_sf.selectType == 1){
            playBGM();
        }else{
            showCG();
        }
    };
    /**
     * 选择分类
     */
    this.updateSort = function(){
        if(_sf.currentStep == 3) return;
        tempSelectType = _sf.selectType = _sf.buttonSort.index;
        tempSelect = _sf.selectIndex = 0;
        _sf.fileBag.obj = _sf.currentList = _sf.selectType == 0 ?_sf.cgList :_sf.bgmList;
        _sf.fileBag.changeIF(new DIf());
        tempProgress = 0;
        _sf.barScroll.button.y = oldY = initBarY;
        _sf.viewportFile.oy = 0;
        _sf.currentStep = 0;
        _sf.updateFile(_sf.fileBag.ctrlItems[0],_sf.fileBag.ctrlItems[0].obj);
    };
    /**
     * 判断档位选择
     * @param ctrl 选中控件
     * @param obj 控件数据
     */
    this.updateFile = function(ctrl,obj){
        if(_sf.currentStep == 4){
            _sf.currentStep = 2;
            return
        }
        if(_sf.currentList.length <= 0 || ctrl == null|| _sf.currentStep == 3) return;
        if(obj != tempObj){
            tempSelect = _sf.selectIndex = ctrl.ctrlIndex;
            RV.GameSet.playSelectSE();
            tempObj = obj;
            _sf.textNum.obj = _sf.currentList[_sf.selectIndex].index;
            _sf.textName.obj = _sf.currentList[_sf.selectIndex].own == true ? _sf.currentList[_sf.selectIndex].data.name : "？？？？？";
            if(_sf.selectType == 0){
                _sf.imageCG.obj = _sf.imageScreenshot.obj = _sf.currentList[_sf.selectIndex].own == true && _sf.currentList[_sf.selectIndex].data.pic != "" ? "Picture/" + _sf.currentList[_sf.selectIndex].data.pic : "System/image-null.png";
                initBitmap(_sf.imageScreenshot);
            }else{
                _sf.currentList[_sf.selectIndex].pic =_sf.currentList[_sf.selectIndex].data.cover;
                _sf.imageCD.obj = _sf.currentList[_sf.selectIndex].own == true && _sf.currentList[_sf.selectIndex].data.cover != "" ?"Picture/" + _sf.currentList[_sf.selectIndex].data.cover : "System/Gallery/image-bgm.png";
                initBitmap(_sf.imageCD);
                _sf.imageCD.angle = 0;
            }
            _sf.chooseBox.x = ctrl.x;
            _sf.chooseBox.y = ctrl.y;
            _sf.currentStep = 1;
        }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.GameSet.playCancelSE();
        LUI.DisposeCtrl(_sf.ctrlItems);
    };
    //==================================== 私有函数 ===================================
    /**
     * 键盘选择判定
     */
    function updatePCKey(){
        if(IInput.isKeyDown(RC.Key.left)){
            _sf.buttonSort.index -= 1;
            _sf.selectType -= 1;
            if(_sf.buttonSort.index < 0){
                _sf.selectType = _sf.buttonSort.index = 0;
            }
            _sf.buttonSort.SelectIndex(_sf.buttonSort.index);
            _sf.updateSort();
        }
        if(IInput.isKeyDown(RC.Key.right)){
            _sf.buttonSort.index += 1;
            _sf.selectType += 1;
            if(_sf.buttonSort.index >= _sf.buttonSort.getMax()) {
                _sf.selectType = _sf.buttonSort.index = _sf.buttonSort.getMax() - 1;
            }
            _sf.buttonSort.SelectIndex(_sf.buttonSort.index);
            _sf.updateSort();
        }
        if(IInput.isKeyDown(RC.Key.down)){
            tempSelect = _sf.selectIndex + 1;
            isKey = true;
        }
        if(IInput.isKeyDown(RC.Key.up)){
            tempSelect = _sf.selectIndex - 1;
            isKey = true;
        }
        if(tempSelect < 0){
            tempSelect = 0;
        }
        if(tempSelect > _sf.currentList.length - 1){
            tempSelect = _sf.currentList.length - 1;
        }
        if(_sf.selectIndex != tempSelect){
            _sf.updateFile(_sf.fileBag.ctrlItems[tempSelect],_sf.fileBag.ctrlItems[tempSelect].obj);
            updateVolumeForSelect(tempSelect);
        }
        if(RC.IsKeyOK()){
            if(!_sf.buttonPlay.getEnable()) return;
            _sf.updatePlay();
            return;
        }
        if(IInput.isKeyDown(RC.Key.cancel)){
            _sf.dispose();
        }
    }


    function updateVolumeForSelect(selectIndex){
        tempProgress = selectIndex / (_sf.fileBag.ctrlItems.length - 1);
        _sf.updateVolume(_sf.barScroll , tempProgress);
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
    }

    /**
     * 显示CG图片
     * @param bitmap 图片资源
     * @param image 图片控件
     */
    function showPic(bitmap,image){
        image.setBitmap(bitmap);
        image.width = bitmap.width;
        image.height = bitmap.height;

        if(image.width <= _sf.backDescription.width && image.height <= _sf.backDescription.height){
            image.zoomX = 1;
            image.zoomY = 1;
            if(_sf.selectType == 0){
                image.x = _sf.backDescription.x + (_sf.backDescription.width - image.width * image.zoomX)/ 2;
            }else{
                image.x = _sf.backDescription.x + (_sf.backDescription.width - image.width * image.zoomX)/ 2 + image.width / 2 * image.zoomX;
            }
            image.opacity = 255;
            return;
        }
        var rate = 0;
        if(image.width >= image.height){
            rate = _sf.backDescription.width / image.width;
        }else{
            rate = _sf.backDescription.height/ 2 / image.height;
        }
        image.zoomX = rate;
        image.zoomY = rate;
        if(_sf.selectType == 0){
            image.x = _sf.backDescription.x + (_sf.backDescription.width - image.width * image.zoomX)/ 2;
        }else{
            image.x = _sf.backDescription.x + (_sf.backDescription.width - image.width * image.zoomX)/ 2 + image.width / 2 * image.zoomX;
        }
        image.opacity = 255;
    }
    /**
     * 预读取CG图片
     * @param image 图片
     */
    function initBitmap(image){
        var bitmap = RF.LoadCache(image.obj);
        if(bitmap.complete){
            showPic(bitmap,image);
        }else{
            bitmap.onload = function(){showPic(bitmap,image);};
            bitmap.onerror = function(){showPic(bitmap,image);};
        }

    }
    /**
     * 获得当前鉴赏列表
     */
    function filterOwnGallery(){
        var count = 0;
        for(var key in RV.NowSet.setCG){
            count += 1;
            if(RV.NowSet.setCG.hasOwnProperty(key)){
                var data = RV.NowSet.setCG[key];
                var own = false;
                var index = 0;
                if(RV.GameSet.nowCGList.indexOf(RV.NowSet.setCG[key].id) != -1){
                    own = true;
                }
                if(count < 10){
                    index = "0" + count;
                }else{
                    index = count;
                }
                var tempCG = {
                    data : data,
                    own : own,
                    index : index,
                    name : data.name
                };
                _sf.cgList.push(tempCG);
            }
        }
        count = 0;
        for(key in RV.NowSet.setBGM){
            count += 1;
            if(RV.NowSet.setBGM.hasOwnProperty(key)){
                data = RV.NowSet.setBGM[key];
                own = false;
                index = 0;
                if(RV.GameSet.nowBGMList.indexOf(RV.NowSet.setBGM[key].id) != -1){
                    own = true;
                }
                if(count < 10){
                    index = "0" + count;
                }else{
                    index = count;
                }
                var tempBGM = {
                    data : data,
                    own : own,
                    index : index,
                    name : data.name
                };
                _sf.bgmList.push(tempBGM);
            }
        }
        _sf.currentList = _sf.cgList;
    }
    /**
     * 播放CG
     */
    function showCG(){
        if(_sf.currentList[_sf.selectIndex].data.type == 0){
            var bitmap = RF.LoadCache(_sf.imageCG.obj);
            _sf.imageCG.setBitmap(bitmap);
            _sf.imageCG.x = (IVal.GWidth - _sf.imageCG.width)/ 2;
            _sf.imageCG.y = (IVal.GHeight - _sf.imageCG.height)/ 2;
            _sf.currentStep = 3;
        }else{
            fadeBGM();
            RV.GameData.playBGMIndex = -1;
            _sf.inPlayBGM = false;
            var id = _sf.currentList[_sf.selectIndex].data.mapId;
            RV.GameData.currentCG = _sf.currentList[_sf.selectIndex].data;
            RV.GameData.playCGIndex = _sf.selectIndex;
            RV.GameData.storyId = id;
            IVal.scene.dispose();
            IVal.scene = new SMain();

        }
    }
    /**
     * 音乐淡出
     */
    function fadeBGM(){
        RV.GameSet.nowBGMFile = "";
        IAudio.BGMFade(parseInt(1));
        _sf.inPlayBGM = false;
    }

    /**
     * 唱片图旋转
     */
    function playBGM (){
        if(_sf.inPlayBGM && _sf.selectIndex == RV.GameData.playBGMIndex){
            RV.GameData.playBGMIndex = -1;
            _sf.imageCD.stopRotate();
            _sf.inPlayBGM = false;
            fadeBGM();
        }else{
            _sf.inPlayBGM = true;
            RV.GameData.playBGMIndex = _sf.selectIndex;
            _sf.imageCD.startRotate(_sf.currentList[_sf.selectIndex].data.speed / 60);
            RV.GameSet.playBGM("Audio/" + _sf.currentList[_sf.selectIndex].data.music,RV.GameSet.nowBGMVolume );
        }
    }
    /**
     * 更新旋转状态
     */
    function rotateCD(){
        if(_sf.selectType == 1){
            if(RV.GameData.playBGMIndex == _sf.selectIndex){
                _sf.imageCD.startRotate(_sf.currentList[RV.GameData.playBGMIndex].data.speed / 60);
            }else{
                _sf.imageCD.stopRotate();
            }

        }
    }
    /**
     * 键盘更新滚动条
     */
    function updateVolumeNum(){
        tempProgress += addVolume;
        _sf.updateVolume(_sf.barScroll , tempProgress);
    }
}/**
 * Created by YewMoon on 2020/07/14.
 * 游戏界面·读取进度
 * @param ui
 */
function WLoad(ui){
    //==================================== 私有属性 ===================================
    var _sf = this;
    var tempSelect = 0;
    var tempObj = null;
    var oldY = 0;
    var nowOy = 0;
    var tempProgress = 0;
    var initBarY = 0;
    var oyRate = 0;
    var addVolume = 0;
    var view = null;
    var isKey = false;
    //==================================== 公有属性 ===================================
    //当前选中项
    this.selectIndex = 0;
    //当前展示列表
    this.currentList = [];
    this.picList = [];
    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function(){
        getSaveList();
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        view = new IViewport(parseInt(_sf.imageScreenshot.x) , parseInt(_sf.imageScreenshot.y) ,parseInt( _sf.imageScreenshot.width) , parseInt(_sf.imageScreenshot.height));
        view.z = _sf.imageScreenshot.z + 10;
        initBarY = oldY = _sf.barScroll.y;
        _sf.updateFile(_sf.fileBag.ctrlItems[_sf.selectIndex],_sf.fileBag.ctrlItems[_sf.selectIndex].obj);
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 更新滚动条移动
     */
    this.updateOffset = function(){
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        var now = (IInput.y - 20) -  _sf.regionScroll.y;
        tempProgress = now / max;
        if(tempProgress > 1) tempProgress = 1;
        if(tempProgress < 0) tempProgress = 0;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
        _sf.updateVolume(_sf.barScroll , tempProgress);
    };
    /**
     * 更新视窗移动
     */
    this.updateVolume = function(ctrl,num){
        var maxHeight = _sf.fileBag.ctrlItems.length * _sf.fileBag.data.dy;
        if(maxHeight > _sf.viewportFile.height){
            _sf.viewportFile.oy = -(num * (maxHeight - _sf.viewportFile.height)) ;
        }else{
            _sf.viewportFile.oy = -(num * 10) ;
        }
    };
    /**
     * 本界面更新
     */
    this.update = function(){
        //updatePCKey();
    };
    /**
     * 读取存档
     */
    this.updateLoad = function(index){
        fadeBGM();
        RV.GameData.menu = 0;
        _sf.dispose();
        RF.LoadGame(index);
    };
    /**
     * 判断档位选择
     * @param ctrl 选中控件
     * @param obj 控件数据
     */
    this.updateFile = function(ctrl,obj){
        if(_sf.currentList.length <= 0 || ctrl == null) return;
        if(obj != tempObj){
            tempSelect = _sf.selectIndex = ctrl.ctrlIndex;
            RV.GameSet.playSelectSE();
            tempObj = obj;
            if(_sf.currentList[_sf.selectIndex].own == true){
                var data = RV.SaveInfo.canvasLoad(_sf.selectIndex);
                recoverPic(data);
            }else{
                disposePic()
            }
            _sf.textNum.obj = _sf.currentList[_sf.selectIndex].index;
            _sf.textName.obj = _sf.currentList[_sf.selectIndex].own == true ? _sf.currentList[_sf.selectIndex].name : "";
            _sf.chooseBox.x = ctrl.x;
            _sf.chooseBox.y = ctrl.y;
        }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.GameSet.playCancelSE();
        disposePic();
        LUI.DisposeCtrl(_sf.ctrlItems);
    };
    //==================================== 私有函数 ===================================
    /**
     * 键盘选择判定
     */
    function updatePCKey(){
        isKey = false;
        if(IInput.isKeyDown(RC.Key.down)){
            tempSelect = _sf.selectIndex + 1;
            isKey = true;
        }
        if(IInput.isKeyDown(RC.Key.up)){
            tempSelect = _sf.selectIndex - 1;
            isKey = true;
        }
        if(tempSelect < 0){
            tempSelect = 0;
        }
        if(tempSelect > _sf.currentList.length - 1){
            tempSelect = _sf.currentList.length - 1;

        }
        if(_sf.selectIndex != tempSelect){
            _sf.updateFile(_sf.fileBag.ctrlItems[tempSelect],_sf.fileBag.ctrlItems[tempSelect].obj);
            if(isKey) updateVolumeForSelect(tempSelect);
        }
        if(RC.IsKeyOK()){
            if(!_sf.buttonEnter.getEnable()) return;
            _sf.getInterpreterMain().addEvents(_sf.buttonEnter.data.clickEvent.eventEvents);
        }
    }

    function updateVolumeForSelect(selectIndex){
        tempProgress = selectIndex / (_sf.fileBag.ctrlItems.length - 1);
        _sf.updateVolume(_sf.barScroll , tempProgress);
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
    }

    function getSaveList(){
        for(var i = 0; i<50; i++){
            var tempSave = null;
            var index = 0;
            var name = "";
            if(i == 0){
                index = "自动"
            }else if(i < 10){
                index = "0"+ i
            }else{
                index = i
            }
            if(RV.SaveInfo.list[i] != null){
                name = RV.NowProject.findMap(RV.SaveInfo.list[i].storyId).name;
                tempSave = {
                    gameTime : RF.getDate(RV.SaveInfo.list[i].gameTime),
                    storyId : RV.SaveInfo.list[i].storyId,
                    own : true,
                    index : index,
                    name : name
                };
            }else{
                tempSave = {
                    gameTime : "",
                    storyId : -1,
                    own : false,
                    index : index,
                    name : name
                };
            }
            _sf.currentList.push(tempSave)

        }

    }
    /**
     * 音乐淡出
     */
    function fadeBGM(){
        RV.GameSet.nowBGMFile = "";
        IAudio.BGMFade(parseInt(1));
    }
    /**
     * 键盘更新滚动条
     */
    function updateVolumeNum(){
        tempProgress += addVolume;
        if(tempProgress < 0) tempProgress = 0;
        if(tempProgress > 1) tempProgress = 1;
        _sf.updateVolume(_sf.barScroll , tempProgress);
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
    }

    function recoverPic(data){
        if(data.canvasData == null) return;
        disposePic();
        var rate = 0;
        if(_sf.imageScreenshot.width >= _sf.imageScreenshot.height){
            rate = _sf.imageScreenshot.width/RV.NowProject.gameWidth;
        }else{
            rate = _sf.imageScreenshot.height/RV.NowProject.gameHeight;
        }
        var picSet = data.canvasData.pics;
        //还原图片
        for(var i = 0;i<picSet.length;i++){
            var sp = new ISprite(RF.LoadBitmap("Picture/" + picSet[i].path),view);
            sp.path = picSet[i].path;
            sp.yx = picSet[i].yx;
            sp.yy = picSet[i].yy;
            sp.x = picSet[i].x  * rate;
            sp.y = picSet[i].y  * rate;
            sp.zoomX = picSet[i].zoomX * rate;
            sp.zoomY = picSet[i].zoomY * rate;
            sp.opacity = picSet[i].opacity;
            sp.angle = picSet[i].angle;
            sp.mirror = picSet[i].mirror;
            sp.z = picSet[i].z;
            _sf.picList.push(sp);
        }
    }
    function disposePic(){
        for(var i = 0; i < _sf.picList.length; i++){
            _sf.picList[i].dispose();
        }
    }
}/**
 * Created by YewMoon on 2020/7/22.
 * 游戏界面·剧情回顾
 * @param ui
 */
function WLog(ui){
    //==================================== 私有属性 ===================================
    var _sf = this;
    var oldY = 0;
    var nowOy = 0;
    var tempProgress = 0;
    var waitTime = 0;
    var addVolume = 0;
    var waitMax = 10;
    var oyRate = 0;
    //==================================== 公有属性 ===================================
    //当前文字记录
    this.msgList = [];
    //显示文字列表
    this.msg = "";
    //滚动条是否加载完毕
    this.barLoadOver = false;
    this.initBar = false;
    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function(){
        _sf.msgList = RV.GameData.msgLog;
        for(var i = 0; i<_sf.msgList.length; i++){
            var name = "";
            if(_sf.msgList[i].name != ""){
                name = _sf.msgList[i].name + "\\n"
            }
            var text = _sf.msgList[i].msg + "\\n" + "\\n";
            _sf.msg += name + text;
        }
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 更新滚动条移动
     */
    this.updateOffset = function(){
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        var now = (IInput.y - 20) -  _sf.regionScroll.y;
        tempProgress = now / max;
        if(tempProgress > 1) tempProgress = 1;
        if(tempProgress < 0) tempProgress = 0;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
        _sf.updateVolume(_sf.barScroll , tempProgress);
    };

    /**
     * 更新视窗移动
     */
    this.updateVolume = function(ctrl,num){
        var maxHeight = _sf.textLog.height;
        if(maxHeight > _sf.viewportLog.height){
            _sf.viewportLog.oy = -(num * (maxHeight - _sf.viewportLog.height)) ;
        }else{
            _sf.viewportLog.oy = -(num * 10) ;
        }
    };
    /**
     * 本界面刷新
     */
    this.update = function(){
        if(!_sf.barLoadOver) return;
        if(_sf.initBar){
            RV.NowCanvas.message.fadeOut();
            tempProgress = 1;
            var max = _sf.regionScroll.height - _sf.barScroll.button.height;
            _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
            _sf.updateVolume(_sf.barScroll , tempProgress);
            _sf.initBar = false;
        }
        updatePCKey();
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.NowCanvas.message.fadeIn();
        RV.GameSet.playCancelSE();
        LUI.DisposeCtrl(_sf.ctrlItems);
    };
    //==================================== 私有函数 ===================================
    /**
     * 判断PC端按钮的选择
     */
    function updatePCKey(){
        if(IInput.isKeyPress(RC.Key.down)){//按下向下键
            waitTime -= 1;
            addVolume = 0.02;
            updateVolumeNum()
        }else if(IInput.isKeyPress(RC.Key.up)){//按下向上键
            waitTime -= 1;
            addVolume = -0.02;
            updateVolumeNum()
        }else{
            waitMax = 5;
        }

    }
    /**
     * 键盘更新滚动条
     */
    function updateVolumeNum(){
        if(waitTime <= 0){
            waitTime = waitMax;
            if(waitMax > 0) waitMax -= 1;
            tempProgress += addVolume;
            if(tempProgress < 0) tempProgress = 0;
            if(tempProgress > 1) tempProgress = 1;
            _sf.updateVolume(_sf.barScroll , tempProgress);
            var max = _sf.regionScroll.height - _sf.barScroll.button.height;
            _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
        }
    }

}
/**
 * Created by YewMoon on 2020/5/27.
 * 游戏界面·菜单
 * @param ui
 */
function WMenu(ui){
    var _sf = this;
    this.keyName = "";
    this.keyCode = "";
    this.init = function(){

    };
    this.initAfter = function(){
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    this.update = function(){
        //  if(IInput.isKeyDown(RC.Key.down)){
        //         _sf.buttonGroup.index += 1;
        //         if(_sf.buttonGroup.index >= _sf.buttonGroup.getMax()) {
        //             _sf.buttonGroup.index = 0;
        //         }
        //         _sf.buttonGroup.SelectIndex(_sf.buttonGroup.index);
        //     }
        //     if(IInput.isKeyDown(RC.Key.up)){
        //         _sf.buttonGroup.index -= 1;
        //         if(_sf.buttonGroup.index < 0) {
        //             _sf.buttonGroup.index = _sf.buttonGroup.getMax() - 1;
        //         }
        //         _sf.buttonGroup.SelectIndex(_sf.buttonGroup.index);
        //     }
        //     if(RC.IsKeyOK()){
        //         _sf.buttonGroup.DoAction(_sf.buttonGroup.index);
        //     }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.NowCanvas.message.fadeIn();
        RV.GameSet.playCancelSE();
        LUI.DisposeCtrl(_sf.ctrlItems);
    }
}/**
 * Created by YewMoon on 2020/7/22.
 * 游戏界面·询问框
 * @param ui
 * @param msgData 询问框数据
 */
function WMessageBox(ui,msgData){
    //==================================== 私有属性 ===================================
    var _sf = this;
    //==================================== 公有属性 ===================================
    this.msg = "";
    this.confirmText = "";
    this.cancelText = "";
    this.endDo = null;
    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function(){
        if(msgData != null && msgData != undefined){
            var temp = msgData.split("||");
            _sf.msg = temp[0];
            _sf.confirmText = temp[1];
            _sf.cancelText = temp[2];
        }
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        _sf.backMain.width = _sf.textMsg.width + _sf.textMsg.data.x * 2 + 100;
        _sf.backMain.height = _sf.textMsg.height + _sf.textMsg.data.y * 2 + _sf.buttonConfirm.height + 80;
        if(_sf.backMain.width <= 270)_sf.backMain.width = 380;
        _sf.backMain.x = (IVal.GWidth -  _sf.backMain.width)/ 2;
        _sf.backMain.y = (IVal.GHeight -  _sf.backMain.height)/ 2;
        _sf.textMsg.x = _sf.backMain.x + (_sf.backMain.width - _sf.textMsg.width) / 2;
        _sf.textMsg.y = _sf.backMain.y + _sf.textMsg.data.y;
        if(_sf.cancelText == ""){
            _sf.buttonConfirm.x = _sf.backMain.x + (_sf.backMain.width - _sf.buttonConfirm.width) / 2;
        }else{
            _sf.buttonConfirm.x = _sf.backMain.x + (_sf.backMain.width/ 2 - _sf.buttonConfirm.width) / 2;
            _sf.buttonCancel.x = _sf.backMain.x + _sf.backMain.width/ 2 + (_sf.backMain.width/ 2 - _sf.buttonCancel.width) / 2;
            _sf.buttonCancel.y = _sf.backMain.y + _sf.backMain.height - _sf.buttonCancel.height - 14;
        }
        _sf.buttonConfirm.y = _sf.backMain.y + _sf.backMain.height - _sf.buttonConfirm.height - 14;
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 本界面刷新
     */
    this.update = function(){
        if(RC.IsKeyOK()){
            RV.GameSet.playEnterSE();
            _sf.dispose(0)
        }
        if(_sf.cancelText != "" && IInput.isKeyDown(RC.Key.cancel)){
            RV.GameSet.playCancelSE();
            _sf.dispose(1);
        }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(message){
        if (_sf.endDo != null) _sf.endDo(message);
        LUI.DisposeCtrl(_sf.ctrlItems);
    }
}/**
 * Created by YewMoon on 2020/7/14.
 * 游戏界面·系统
 * @param ui
 */
function WOption(ui){
    var _sf = this;
    //==================================== 公有属性 ===================================
    this.bgm = null;
    this.se = null;
    this.voice = null;
    this.speed = null;
    this.autoSpeed = null;
    this.barLoadOver = false;
    //当前选中序号
    this.selectIndex = 0;
    this.initBar = false;
    //==================================== 私有属性 ===================================
    var waitMax = 10;
    var addVolume = 0;
    var waitTime = 0;
    var tempVolume = 0;
    //==================================== 私有函数 ===================================

    /**
     * 判断PC端按钮的选择
     */
    function updatePCKey(){
        if(IInput.isKeyDown(RC.Key.down)){//按下向下键
            RV.GameSet.playSelectSE();
            _sf.selectIndex += 1;
            _sf.buttonBack.index += 1;
            if(_sf.buttonBack.index >= _sf.buttonBack.getMax()) {
                _sf.buttonBack.index = _sf.buttonBack.getMax() - 1;
                _sf.selectIndex -= 1;
            }
            _sf.buttonBack.SelectIndex(_sf.buttonBack.index);
        }
        //选择框向上移动
        if(IInput.isKeyDown(RC.Key.up)){//按下向上键
            RV.GameSet.playSelectSE();
            _sf.selectIndex -= 1;
            _sf.buttonBack.index -= 1;
            if(_sf.buttonBack.index < 0) {
                _sf.buttonBack.index = 0;
                _sf.selectIndex += 1;
            }
            _sf.buttonBack.SelectIndex(_sf.buttonBack.index);
        }

        //按下左调节按钮
        if(IInput.isKeyPress(RC.Key.left)){//按下向左键
            if(_sf.buttonBack.index == _sf.buttonBack.getMax() - 1){
                _sf.buttonEnd.index = 0;
                _sf.buttonEnd.SelectIndex(_sf.buttonEnd.index);
            }else{
                waitTime -= 1;
                addVolume = -1;
            }

        }else if(IInput.isKeyPress(RC.Key.right)){//按下向右键
            if(_sf.buttonBack.index == _sf.buttonBack.getMax() - 1){
                _sf.buttonEnd.index = _sf.buttonEnd.getMax() - 1;
                _sf.buttonEnd.SelectIndex(_sf.buttonEnd.index);
            }else{
                waitTime -= 1;
                addVolume = 1;
            }
        }else{
            waitMax = 10;
        }
        updateVolumeNum(_sf.selectIndex);

        if(RC.IsKeyOK()){
            if(_sf.selectIndex == _sf.buttonBack.getMax() - 1){
                _sf.buttonEnd.DoAction(_sf.buttonEnd.index);
                return true;
            }
        }
    }
    /**
     * 键盘更新音量（速度）
     * @param type 选择项
     */
    function updateVolumeNum(type){
        if(type == 5) return;
        if(waitTime <= 0){
            waitTime = waitMax;
            if(waitMax > 0) waitMax -= 1;
            if(type == 0){
                tempVolume =  RV.GameSet.BGMVolume;
                tempVolume += addVolume;
                _sf.bgm.value = RV.GameSet.BGMVolume = _sf.updateVolume(_sf.barBGM , tempVolume);
            }else if(type == 1){
                tempVolume = RV.GameSet.SEVolume;
                tempVolume += addVolume;
                _sf.se.value = RV.GameSet.SEVolume = _sf.updateVolume(_sf.barSE , tempVolume);
            }else if(type == 2){
                tempVolume = RV.GameSet.VoiceVolume;
                tempVolume += addVolume;
                _sf.voice.value = RV.GameSet.VoiceVolume = _sf.updateVolume(_sf.barVoice , tempVolume);
            }else if(type == 3){
                tempVolume = RV.GameSet.textSpeed;
                tempVolume += addVolume;
                _sf.speed.value = RV.GameSet.textSpeed = _sf.updateVolume(_sf.barSpeed , tempVolume);
            }else if(type == 4){
                tempVolume = RV.GameSet.autoSpeed;
                tempVolume += addVolume;
                _sf.autoSpeed.value = RV.GameSet.autoSpeed = _sf.updateVolume(_sf.barAuto , tempVolume);
            }
        }
    }

    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function (){
        _sf.bgm = {
            value :RV.GameSet.BGMVolume,
            maxValue : 100,
            ratio :parseInt(RV.GameSet.BGMVolume / 100 * 100) + "%"
        };
        _sf.se = {
            value :RV.GameSet.SEVolume,
            maxValue : 100,
            ratio :parseInt(RV.GameSet.SEVolume / 100 * 100) + "%"
        };
        _sf.voice = {
            value :RV.GameSet.VoiceVolume,
            maxValue : 100,
            ratio :parseInt(RV.GameSet.VoiceVolume / 100 * 100) + "%"
        };
        _sf.speed = {
            value :RV.GameSet.textSpeed,
            maxValue : 7,
            ratio :"正常"
        };
        _sf.autoSpeed = {
            value :RV.GameSet.autoSpeed,
            maxValue : 7,
            ratio :"正常"
        };
    };

    /**
     * 更新音量（速度）
     * @param type 选择项
     */
    this.updateMouseVolume = function(type){
        _sf.selectIndex = type;
        var end = 0;
        if(type == 0){
            end = 110 * (( (IInput.x - _sf.barBGM.buttonNum.width / 2) - _sf.regionBgm.x)  / _sf.regionBgm.width);
            tempVolume = end;
            _sf.bgm.value = RV.GameSet.BGMVolume = _sf.updateVolume(_sf.barBGM , tempVolume);
        }else if(type == 1){
            end = 110 * (( (IInput.x - _sf.barSE.buttonNum.width / 2) - _sf.regionSe.x)  / _sf.regionSe.width);
            tempVolume = end;
            _sf.se.value = RV.GameSet.SEVolume = _sf.updateVolume(_sf.barSE , tempVolume);
        }else if(type == 2){
            end = 110 * (( (IInput.x - _sf.barVoice.buttonNum.width / 2) - _sf.regionVoice.x)  / _sf.regionVoice.width);
            tempVolume = end;
            _sf.voice.value = RV.GameSet.VoiceVolume = _sf.updateVolume(_sf.barVoice , tempVolume);
        }else if(type == 3){
            end = 7 * (( (IInput.x - _sf.barSpeed.buttonNum.width / 2) - _sf.regionSpeed.x)  / _sf.regionSpeed.width);
            tempVolume = end;
            _sf.speed.value = RV.GameSet.textSpeed = _sf.updateVolume(_sf.barSpeed , tempVolume);
        }else if(type == 4){
            end = 7 * (( (IInput.x - _sf.barAuto.buttonNum.width / 2) - _sf.regionAuto.x)  / _sf.regionAuto.width);
            tempVolume = end;
            _sf.autoSpeed.value = RV.GameSet.autoSpeed = _sf.updateVolume(_sf.barAuto , tempVolume);
        }
    };
    /**
     * 更新音量（速度）数字与控件位置
     * @param ctrl 选择控件
     * @param num 量
     */
    this.updateVolume = function(ctrl,num){
        var end =  0;
        var nowX =  0;
        if(ctrl == _sf.barSpeed || ctrl == _sf.barAuto){
            end =  parseInt(Math.min(6,Math.max(0,num)));
            nowX =  ctrl.barNum.x + ((end / 6) * ctrl.barNum.width);
            var sp = end;
            if(sp >= 0 && sp < 1){
                ctrl.obj.ratio = "极慢";
            }else if(sp >= 1 && sp < 2){
                ctrl.obj.ratio = "慢";
            }else if(sp >= 2 && sp < 3){
                ctrl.obj.ratio = "稍慢";
            }else if(sp >= 3 && sp < 4){
                ctrl.obj.ratio = "正常";
            }else if(sp >= 4 && sp < 5){
                ctrl.obj.ratio = "稍快";
            }else if(sp >= 5 && sp < 6){
                ctrl.obj.ratio = "快";
            }else if(sp >= 6){
                ctrl.obj.ratio = "极快";
            }
        }else{
            end =  parseInt(Math.min(100,Math.max(0,num)));
            nowX =  ctrl.barNum.x + ((end / 100) * ctrl.barNum.width);
            ctrl.obj.ratio = end + "%";
        }
        ctrl.buttonNum.x = nowX;
        return end;
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 本界面刷新
     */
    this.update = function(){
        if(!_sf.barLoadOver) return;
        //updatePCKey();
        if(_sf.initBar){
            RV.GameSet.SEVolume = _sf.updateVolume(_sf.barSE , RV.GameSet.SEVolume);
            RV.GameSet.BGMVolume = _sf.updateVolume(_sf.barBGM , RV.GameSet.BGMVolume);
            RV.GameSet.VoiceVolume = _sf.updateVolume(_sf.barVoice , RV.GameSet.VoiceVolume);
            RV.GameSet.textSpeed = _sf.updateVolume(_sf.barSpeed , RV.GameSet.textSpeed);
            RV.GameSet.autoSpeed = _sf.updateVolume(_sf.barAuto , RV.GameSet.autoSpeed);
            _sf.initBar = false;
        }
        if(IInput.isKeyDown(RC.Key.cancel)){//按下取消按钮、关闭按钮或按下关闭键
            RV.GameSet.save();
        }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.GameSet.save();
        RV.GameSet.playCancelSE();
        LUI.DisposeCtrl(_sf.ctrlItems);
    }
}/**
 * Created by YewMoon on 2020/07/14.
 * 游戏界面·保存进度
 * @param ui
 */
function WSave(ui){
    //==================================== 私有属性 ===================================
    var _sf = this;
    var tempSelect = 0;
    var tempObj = null;
    var oldY = 0;
    var nowOy = 0;
    var tempProgress = 0;
    var initBarY = 0;
    var oyRate = 0;
    var addVolume = 0;
    var view = null;
    var isKey = false;
    //==================================== 公有属性 ===================================
    //当前选中项
    this.selectIndex = 0;
    //当前展示列表
    this.currentList = [];
    this.picList = [];
    //==================================== 公有函数 ===================================
    /**
     * 初始化执行
     */
    this.init = function(){
        getSaveList();
    };
    /**
     * 初始化后执行
     */
    this.initAfter = function(){
        view = new IViewport(_sf.imageScreenshot.x , _sf.imageScreenshot.y , _sf.imageScreenshot.width , _sf.imageScreenshot.height);
        view.z = _sf.imageScreenshot.z + 10;
        initBarY = oldY = _sf.barScroll.y;
        _sf.updateFile(_sf.fileBag.ctrlItems[_sf.selectIndex],_sf.fileBag.ctrlItems[_sf.selectIndex].obj);
        if(RV.NowCanvas == null) return;
        if(!RV.NowCanvas.message.isMsgFadeOut()){
            RV.NowCanvas.message.fadeOut();
        }
    };
    /**
     * 更新滚动条移动
     */
    this.updateOffset = function(){
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        var now = (IInput.y - 20) -  _sf.regionScroll.y;
        tempProgress = now / max;
        if(tempProgress > 1) tempProgress = 1;
        if(tempProgress < 0) tempProgress = 0;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
        _sf.updateVolume(_sf.barScroll , tempProgress);
    };
    /**
     * 更新视窗移动
     */
    this.updateVolume = function(ctrl,num){
        var maxHeight = _sf.fileBag.ctrlItems.length * _sf.fileBag.data.dy;
        if(maxHeight > _sf.viewportFile.height){
            _sf.viewportFile.oy = -(num * (maxHeight - _sf.viewportFile.height)) ;
        }else{
            _sf.viewportFile.oy = -(num * 10) ;
        }
    };
    /**
     * 本界面更新
     */
    this.update = function(){
        //updatePCKey();
    };
    /**
     * 保存存档
     */
    this.updateSave = function(index){
        RV.SaveInfo.save(index);
        var data = RV.SaveInfo.canvasLoad(index);
        recoverPic(data);
        var selfIndex = 0;
        if(index < 10){
            selfIndex = "0"+ index
        }else{
            selfIndex = index
        }
        var tempSave = {
            gameTime : RF.getDate(RV.SaveInfo.list[index].gameTime),
            storyId : RV.SaveInfo.list[index].storyId,
            own : true,
            index : selfIndex,
            name : RV.NowProject.findMap(RV.SaveInfo.list[index].storyId).name
        };
        _sf.textName.obj = tempSave.name;
        _sf.textTime.obj = tempSave.gameTime;
        _sf.fileBag.ctrlItems[index].obj = _sf.currentList[index] = tempSave;

    };
    /**
     * 删除存档
     */
    this.deleteSave = function(index){
        disposePic();
        var selfIndex = 0;
        if(index < 10){
            selfIndex = "0"+ index
        }else{
            selfIndex = index
        }
        var tempSave = {
            gameTime : "",
            storyId : -1,
            own : false,
            index : selfIndex,
            name : ""
        };
        RV.SaveInfo.list[index] = null;
        RV.SaveInfo.saveAll();
        var ctrl = _sf.fileBag.ctrlItems[index];
        ctrl.obj = _sf.currentList[index] = tempSave;
    };
    /**
     * 判断档位选择
     * @param ctrl 选中控件
     * @param obj 控件数据
     */
    this.updateFile = function(ctrl,obj){
        if(_sf.currentList.length <= 0 || ctrl == null) return;
        if(obj != tempObj){
            tempSelect = _sf.selectIndex = ctrl.ctrlIndex;
            RV.GameSet.playSelectSE();
            tempObj = obj;
            if(_sf.currentList[_sf.selectIndex].own == true){
                var data = RV.SaveInfo.canvasLoad(_sf.selectIndex);
                recoverPic(data);
            }else{
                disposePic()
            }
            _sf.textNum.obj = _sf.currentList[_sf.selectIndex].index;
            _sf.textName.obj = _sf.currentList[_sf.selectIndex].own == true ? _sf.currentList[_sf.selectIndex].name : "";

            _sf.chooseBox.x = ctrl.x;
            _sf.chooseBox.y = ctrl.y;
        }
    };
    /**
     * 本界面释放
     */
    this.dispose = function(){
        RV.GameSet.playCancelSE();
        disposePic();
        LUI.DisposeCtrl(_sf.ctrlItems);
    };
    //==================================== 私有函数 ===================================
    /**
     * 键盘选择判定
     */
    function updatePCKey(){
        if(IInput.isKeyDown(RC.Key.down)){
            tempSelect = _sf.selectIndex + 1;
            isKey = true;
        }
        if(IInput.isKeyDown(RC.Key.up)){
            tempSelect = _sf.selectIndex - 1;
            isKey = true;
        }
        if(tempSelect < 0){
            tempSelect = 0;
        }
        if(tempSelect > _sf.currentList.length - 1){
            tempSelect = _sf.currentList.length - 1;
        }
        if(_sf.selectIndex != tempSelect){
            _sf.updateFile(_sf.fileBag.ctrlItems[tempSelect],_sf.fileBag.ctrlItems[tempSelect].obj);
            if(isKey) updateVolumeForSelect(tempSelect);
        }
        if(RC.IsKeyOK()){
            if(!_sf.buttonEnter.getEnable()) return;
            _sf.getInterpreterMain().addEvents(_sf.buttonEnter.data.clickEvent.eventEvents);
            return;
        }
        if(IInput.isKeyDown(46)){
            if(!_sf.buttonDel.getEnable()) return;
            _sf.getInterpreterMain().addEvents(_sf.buttonDel.data.clickEvent.eventEvents);
        }
    }

    function updateVolumeForSelect(selectIndex){
        tempProgress = selectIndex / (_sf.fileBag.ctrlItems.length - 1);
        _sf.updateVolume(_sf.barScroll , tempProgress);
        var max = _sf.regionScroll.height - _sf.barScroll.button.height;
        _sf.barScroll.button.y = _sf.regionScroll.y + tempProgress *  max;
    }

    function getSaveList(){
        for(var i = 0; i<50; i++){
            var tempSave = null;
            var index = 0;
            var name = "";
            if(i == 0){
                index = "自动"
            }else if(i < 10){
                index = "0"+ i
            }else{
                index = i
            }
            if(RV.SaveInfo.list[i] != null){
                name = RV.NowProject.findMap(RV.SaveInfo.list[i].storyId).name;
                tempSave = {
                    gameTime : RF.getDate(RV.SaveInfo.list[i].gameTime),
                    storyId : RV.SaveInfo.list[i].storyId,
                    own : true,
                    index : index,
                    name : name
                };
            }else{
                tempSave = {
                    gameTime : "",
                    storyId : -1,
                    own : false,
                    index : index,
                    name : name
                };
            }
            _sf.currentList.push(tempSave)

        }

    }
    /**
     * 键盘更新滚动条
     */
    function updateVolumeNum(){
        tempProgress += addVolume;
        _sf.updateVolume(_sf.barScroll , tempProgress);
    }

    function recoverPic(data){
        if(data.canvasData == null) return;
        disposePic();
        var rate = 0;
        if(_sf.imageScreenshot.width >= _sf.imageScreenshot.height){
            rate = _sf.imageScreenshot.width/RV.NowProject.gameWidth;
        }else{
            rate = _sf.imageScreenshot.height/RV.NowProject.gameHeight;
        }
        var picSet = data.canvasData.pics;
        //还原图片
        for(var i = 0;i<picSet.length;i++){
            var sp = new ISprite(RF.LoadBitmap("Picture/" + picSet[i].path),view);
            sp.path = picSet[i].path;
            sp.yx = picSet[i].yx;
            sp.yy = picSet[i].yy;
            sp.x = picSet[i].x  * rate;
            sp.y = picSet[i].y  * rate;
            sp.zoomX = picSet[i].zoomX * rate;
            sp.zoomY = picSet[i].zoomY * rate;
            sp.opacity = picSet[i].opacity;
            sp.angle = picSet[i].angle;
            sp.mirror = picSet[i].mirror;
            sp.z = picSet[i].z;
            _sf.picList.push(sp);
        }
    }
    function disposePic(){
        for(var i = 0; i < _sf.picList.length; i++){
            _sf.picList[i].dispose();
        }
    }
}