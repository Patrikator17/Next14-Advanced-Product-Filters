"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Filter } from "lucide-react";
import { useCallback, useState } from "react";
import axios from 'axios'
import { QueryResult } from "@upstash/vector";
import { Product as ProductType } from "@/db";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductState } from "@/lib/validators/product-validator";
import { Slider } from "@/components/ui/slider";
import debounce from 'lodash.debounce'
import EmptyState from "@/components/Products/EmptyState";


const SORT_OPTIONS = [
  {name: 'None', value: 'none'},
  {name: 'Price: Low to High', value: 'Asc'},
  {name: 'Price: High to Low', value: 'Desc'},
] as const

const SUB_CATEGORIES = [
  {name: 'T-Shirts', selected: true, href: '#'},
  {name: 'Hoodies', selected: false, href: '#'},
  {name: 'Sweatshirts', selected: false, href: '#'},
  {name: 'Accessories', selected: false, href: '#'},
]

const COLOR_FILTERS = {
  id: 'color',
  name: 'Color',
  options: [
    {value: 'white', label: 'White'},
    {value: 'beige', label: 'Beige'},
    {value: 'blue', label: 'Blue'},
    {value: 'green', label: 'Green'},
    {value: 'purple', label: 'Purple'},
  ] as const
}

const SIZE_FILTERS = {
  id: 'size',
  name: 'Size',
  options: [
    {value: 'S', label: 'S'},
    {value: 'M', label: 'M'},
    {value: 'L', label: 'L'},
  ] 
} as const

const PRICE_FILTERS = {
  id: 'price',
  name: 'Price',
  options:[
    {value: [0, 100], label: 'Any Price'}, 
    {value: [0,20], label: 'Under 20$'},
    {value: [0,40], label: 'Under 40$'},
    
    // custom option defined in jsx
]
} as const

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number]

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ['white', 'beige', 'green', 'purple', 'blue'],
    sort: 'none',
    price: {isCustom: false, range: DEFAULT_CUSTOM_PRICE},
    size: ['S', 'M', 'L']
  })
  console.log(filter);

  const {data: products, refetch} = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const {data} = await axios.post<QueryResult<ProductType>[]>(
        'http://localhost:3000/api/products', {
          filter:{
            sort: filter.sort,
            color: filter.color,
            size: filter.size,
            price: filter.price.range
          },
        }
      )
      return data
    },
  }) // read data

  // console.log(products);

  const onSubmit = () => refetch()

  const debounceSubmit = debounce(onSubmit, 500)
  const _debounceSubmit = useCallback(debounceSubmit, [])

  const applyArrayFilter = ({
    category, value
  } : {
    category: keyof Omit <typeof filter, 'price' | 'sort'>
    value: string // S | M | L
  }) => {
    const isFilterApplied = filter[category].includes(value as never)

    if(isFilterApplied){
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value)
      }))
    }else{
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value]
      }))
    }

    _debounceSubmit()
  }

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1])
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1])
  
  
  return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-600 pb-6 pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Cotton Tops Selections
          </h1>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className='group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                Sort
                <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600"/>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                {SORT_OPTIONS.map((option) => (
                  <button 
                    key={option.name} 
                    className={cn('text-left w-full block px-4 py-2 text-sm', {
                      'text-gray-900': option.value === filter.sort,
                      'text-gray-500': option.value !== filter.sort
                    })}
                    onClick={() => {
                      setFilter((prev) => ({
                        ...prev,
                        sort: option.value
                      }))
                      _debounceSubmit()
                    }}>
                      {option.name}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>


            <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
              <Filter className="h-5 w-5"/>
            </button>
          </div>
        </div>

        <section className="pb-24 pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">

            {/* Filters */}
            <div className="hidden lg:block">
                <ul className="space-y-4 border-b border-gray-300 pb-6 text-sm font-medium text-gray-900">
                  {SUB_CATEGORIES.map((category)=> (
                    <li key={category.name}>
                      <button disabled={!category.selected} className="disabled:cursor-not-allowed disabled:opacity-60">
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>

                <Accordion type="multiple" className="animate-none">
                  {/* Color Filter */}
                  <AccordionItem value="color">
                    <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                      <span className="font-medium text-gray-900">Color</span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-6 animate-none">
                      <ul className="space-y-4">
                        {COLOR_FILTERS.options.map((option, optIndex) => (
                          <li key={optIndex} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`color-${optIndex}`} 
                              className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-400"
                              onChange={() => {
                                applyArrayFilter({
                                  category: 'color',
                                  value: option.value
                                  
                                })
                              }}
                              checked={filter.color.includes(option.value)}
                            />
                            <label htmlFor={`color-${optIndex}`} className="ml-3 text-sm text-gray-600">
                              {option.label}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>


                  {/* Size Filter */}
                  <AccordionItem value="size">
                    <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                      <span className="font-medium text-gray-900">Size</span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-6 animate-none">
                      <ul className="space-y-4">
                        {SIZE_FILTERS.options.map((option, optIndex) => (
                          <li key={optIndex} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`size-${optIndex}`} 
                              className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-400"
                              onChange={() => {
                                applyArrayFilter({
                                  category: 'size',
                                  value: option.value
                                  
                                })
                              }}
                              checked={filter.size.includes(option.value)}
                            />
                            <label htmlFor={`size-${optIndex}`} className="ml-3 text-sm text-gray-600">
                              {option.label}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>


                  {/* Price Filter */}
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                      <span className="font-medium text-gray-900">Price</span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-6 animate-none">
                      <ul className="space-y-4">
                        {PRICE_FILTERS.options.map((option, optIndex) => (
                          <li key={optIndex} className="flex items-center">
                            <input 
                              type="radio" 
                              id={`price-${optIndex}`} 
                              className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-400"
                              onChange={() => {
                                setFilter((prev) => ({
                                  ...prev,
                                  price:{
                                    isCustom: false,
                                    range: [...option.value]
                                  }
                                }))
                                _debounceSubmit()
                              }}
                              checked={
                                !filter.price.isCustom && filter.price.range[0] === option.value[0] &&
                                filter.price.range[1] === option.value[1]
                              }
                              
                            />
                            <label htmlFor={`price-${optIndex}`} className="ml-3 text-sm text-gray-600">
                              {option.label}
                            </label>
                          </li>
                        ))}
                        <li className="flex justify-center flex-col gap-2">
                          <div>
                            <input 
                              type="radio" 
                              id={`price-${PRICE_FILTERS.options.length}`} 
                              className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-400"
                              onChange={() => {
                                setFilter((prev) => ({
                                  ...prev,
                                  price:{
                                    isCustom: true,
                                    range: [0,100]
                                  }
                                }))
                              }}
                              checked={filter.price.isCustom}
                            />
                            <label htmlFor={`price-${PRICE_FILTERS.options.length}`} className="ml-3 text-sm text-gray-600">
                              Custom
                            </label>
                          </div>

                          <div className="flex justify-between">
                              <p className="font-medium">Price</p>
                              <div>
                                {filter.price.isCustom ? minPrice.toFixed(0) : filter.price.range[0].toFixed(0)} $ -{' '}
                                {filter.price.isCustom ? maxPrice.toFixed(0) : filter.price.range[1].toFixed(0)} $
                              </div>
                          </div>

                          <Slider className={cn({
                            'opacity-50': !filter.price.isCustom,
                          })}
                          disabled={!filter.price.isCustom}
                          onValueChange={(range) => {
                            const[newMin, newMax] = range
                            setFilter((prev) => ({
                              ...prev,
                              price:{
                                isCustom:true,
                                range: [newMin, newMax]
                              }
                            }))
                            debounceSubmit()
                          }}
                          value={filter.price.isCustom ? filter.price.range : DEFAULT_CUSTOM_PRICE}
                          min={DEFAULT_CUSTOM_PRICE[0]}
                          defaultValue={DEFAULT_CUSTOM_PRICE}
                          max={DEFAULT_CUSTOM_PRICE[1]}
                          step={1}/>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>


                  
                </Accordion>
            </div>

            {/* Product Grid */}
              <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {products && products.length === 0 ? (
                  <EmptyState /> 
                ) : products ? (
                  products.map((product, index) => (
                    <Product key={index} product={product.metadata!} />
                  ))
                ) : ( 
                  new Array(12).fill(null).map((_, i) => <ProductSkeleton key={i} />)
                )}
              </ul>
          </div>
        </section>
      </main>
  );
}
