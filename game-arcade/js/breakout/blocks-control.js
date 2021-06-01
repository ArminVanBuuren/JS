"use strict";

function BlockCollectionControl(cnv, ctx, is, ss){
    BaseControl.call(this);
    var self = this;

    self.canvas = cnv;
    self.context = ctx;
    self.imgs = is;
    self.sounds = ss;

    // self.rows = 8;
    // self.cols = 16;

    self.rows = [
        { col: 6, interval: [ -1, 0 ], imgByRow: true },
        { col: 9, interval: [ 3, -3, 3 ], imgByRow: false },
        { col: 8, interval: [ 0 ], imgByRow: true },
        { col: 7, interval: [ 3, -1, 3], imgByRow: false },
        { col: 12, interval: [ 1, -2, 3, -2, 1], imgByRow: false },
        { col: 8, interval: [ 0 ], imgByRow: true },
        
    ];
    self.cols = [
        { col: 10, interval: [ 4, -2 ], },
        { col: 16, interval: [ 0 ], },
        { col: 16, interval: [ 2, -2, 3, -2, 3, -2, 2 ], },
        { col: 16, interval: [ 4, -2, 4, -2, 4 ], },
        { col: 14, interval: [ 6, -2, 6 ], },
        { col: 16, interval: [ 0 ], },
    ];

    self.items = [];

    self.create = function(round){

        let rRows = self.rows[round];
        let rCols = self.cols[round];

        let ri = 0;
        let rowsInterval = 0;
        let colsInterval = 0;

        let imgIdByRow = 0;
        let imgIdByCol = [];
        
        for (let row = 0; row < rRows.col; row++) {

            if (rRows.imgByRow){
                imgIdByRow = self.random(1, 7);
            }
             
            if (rowsInterval == 0){
                rowsInterval = ri >= rRows.interval.length ? rRows.col : rRows.interval[ri];
                ri++;
                if (rowsInterval == 0)
                    rowsInterval = rRows.col;
            }
            
            if (rowsInterval < 0){
                rowsInterval++;
                continue;
            }
            else{
                rowsInterval--;
            }

            let ci = 0;
            for (let col = 0; col < rCols.col; col++) {

                if (!rRows.imgByRow && imgIdByCol.length <= col){
                    imgIdByCol.push(self.random(1, 7));
                }
                    

                if (colsInterval == 0){
                    colsInterval = ci >= rCols.interval.length ? rCols.col : rCols.interval[ci];
                    ci++;
                    if (colsInterval == 0)
                        colsInterval = rCols.col;
                }

                if (colsInterval < 0){
                    colsInterval++;
                    continue;
                }
                else{
                    colsInterval--;
                }

                let block = new BlockControl(self.canvas, self.context, self.imgs, self.sounds);
                let blockWidth = block.width + block.margin;
                let blockHeight = block.height + block.margin;

                let offsetX = (block.canvasWidth - rCols.col * blockWidth) / 2; // позиционирование начальной позции всех блоков по горизнтали
                let offsetY = 100; // позиционирование начальной позции всех блоков по вертикали

                block.image = getImageBlock(rRows.imgByRow ? imgIdByRow : imgIdByCol[col] );
                block.x = blockWidth * col + offsetX;
                block.y = blockHeight * row + offsetY;
                self.items.push(block);
            }
        }
    }

    function getImageBlock(id){
        
        switch (id) {
            case 1: return self.imgs.blockViolet;
            case 2: return self.imgs.blockGreen;
            case 3: return self.imgs.blockRed;
            case 4: return self.imgs.blockBlue;
            case 5: return self.imgs.blockWhite;
            case 6: return self.imgs.blockYellow;
            default: return self.imgs.blockIron;
          }
    }

    self.collideBlock = function(ball){
        for(let index = 0; index < self.items.length; index++) {
            let block = self.items[index];
            if (block.enabled && ball.collide(block)){
                block.destroy();
                return true;
            }
        }
        return false;
    }

    self.render = function(){

        selectBlocks(function(block){
            if (!block.destroyed && block.enabled){
                block.render();
        }});
        selectBlocks(function(block){
            if (!block.destroyed && !block.enabled){
                block.render();
        }});
    }

    // TODO. IE не поддреживает for of
    function selectBlocks(predicate){
        for(let index = 0; index < self.items.length; index++) {
            let block = self.items[index];
            predicate(block);
        }
    }
}
BlockCollectionControl.prototype = Object.create(UIControl.prototype);
BlockCollectionControl.prototype.constructor = BlockCollectionControl;


function BlockControl(cnv, ctx, is, ss){
    UIControl.call(this, cnv, ctx, is, ss);
    var self = this;

    self.enabled = true;
    self.destroyed = false;

    self.imgWidth = 218;
    self.imgHeight = 60;

    self.width = 60;
    self.height = 20;

    self.margin = 4;

    self.destroy = function(){
        self.enabled = false;
        animate();
    }

    function animate() {
        self.image = self.imgs.explode;
        self.maxFramesX = 2;
        self.imgWidth = 122;
        self.imgHeight = 140;

        self.x += 13;
        self.y -= 10;
        self.width = 37;
        self.height = 40;

        setInterval(function(){
            self.frameX++;
            if (self.frameX > self.maxFramesX)
                self.destroyed = true;
        }, 50);
    };

}
BlockControl.prototype = Object.create(UIControl.prototype);
BlockControl.prototype.constructor = BlockControl;
// BlockControl.prototype.init(cnv, ctx, is, ss){

// }