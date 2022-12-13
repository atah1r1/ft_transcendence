// eslint-disable-next-line import/no-anonymous-default-export
export default (ctx: any, paddleC: any, paddleProps: any) => {
    if (!ctx) return;

    class Paddle {
        x: number;
        y: number;
        width: number;
        height: number;
        colour: string;

        constructor(x: number, y: number, width: number, height: number, colour: string) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.colour = colour;
        }

        move() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.colour;
            ctx.strokeStyle = "#042134";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "blue";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fill();
            ctx.closePath();
        }

    }

    let paddle = new Paddle(paddleProps.x, paddleProps.y, paddleProps.width, paddleProps.height, paddleProps.colour);
    paddle.move();
    if (paddleProps.y <= 0) {
        paddleProps.y = 0;
    }
    else if (paddleProps.y >= paddleC.height - paddleProps.height) {
        paddleProps.y = paddleC.height - paddleProps.height;
    }
};