


class CastObjetos {

    constructor() { }
    public mapearUndefinedToNull<T extends object>(obj: T): T {
        const newObj = { ...obj } as any;

        Object.keys(newObj).forEach((key) => {
            if (newObj[key] === undefined) {
                newObj[key] = null;
            }
        });

        return newObj;
    }
}

export default CastObjetos;