import { db } from "@/db"
import { ProductFilterValidator } from "@/lib/validators/product-validator"
import { NextRequest } from "next/server"



class Filter {
    private filters : Map<string, string[]> = new Map

    hasFilter(){
        return this.filters.size > 0
    }

    add(key: string, operator: string, value: string | number){
        const filter = this.filters.get(key) || []
        const formattedValue = typeof value === 'number' ? value : `'${value}'`; // Ensure string values are enclosed in single quotes
        filter.push(`${key} ${operator} ${formattedValue}`);
        this.filters.set(key, filter)
    }

    addRaw(key: string, rawFilter: string){
        this.filters.set(key, [rawFilter])
    }

    get(){
        const parts: string[] = []
        this.filters.forEach((filter) => {
            const groupedValues = filter.join(` OR `)
            parts.push(`(${groupedValues})`)
        })
        return parts.join(` AND `)
    }
}

const AVG_PRODUCT_PRICE = 25
const MAX_PRODUCT_PRICE = 50

export const POST = async (req: NextRequest) => {

    try{
        const body = await req.json()

        // (color = 'white' OR color = 'blue') AND (size = 'L')

        const {color, price, size, sort} = ProductFilterValidator.parse(body.filter)

        const filter = new Filter()

        color.forEach((color) => filter.add('color', '=', color)) // Remove extra single quotes around color
        size.forEach((size) => filter.add('size', '=', size))
        filter.addRaw('price', `price >= ${price[0]} AND price <= ${price[1]}`)

        const generatedFilterString = filter.get()
        console.log("Generated Filter String:", generatedFilterString)

        const products = await db.query({
            topK: 12,
            vector: [0,0,sort === 'none' ? AVG_PRODUCT_PRICE : sort === 'Asc' ? 0 : MAX_PRODUCT_PRICE],
            includeMetadata: true,
            filter : filter.hasFilter() ? filter.get() : undefined
            
        })

        return new Response(JSON.stringify(products))
    }catch(err){
        console.log(err);

        return new Response(JSON.stringify({message: 'Server Error'}),{
            status: 500,
            
        })
        
    }
    
}