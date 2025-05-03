export class CallbackCollection{
    private callbacks: {(...args: any[]): void;}[] = []; // Array of functions returning void
    
    // Constructor
    constructor(...callbacks: {(): void;}[]){
        this.callbacks = callbacks;
    }
    
    // Public methods
    public addCallback(callback: {(): void;}): CallbackCollection{
        this.callbacks.push(callback);
        return this;
    }
    
    public fire(...args: any[]): void{
        for(var i = 0; i < this.callbacks.length; i++){
            this.callbacks[i](...args);
        }
    }
    
    public reset(): void{
        this.callbacks = [];
    }
}