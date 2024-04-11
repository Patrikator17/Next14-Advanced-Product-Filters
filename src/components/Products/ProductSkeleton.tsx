const ProductSkeleton = () => {
    return(
        <div className="relative animate-pulse">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-300 lg:aspect-none lg:h-80">
                <div  className="h-full w-full bg-gray-300"/>
            </div>
            <div className="mt-4 flex flex-col gap-2">
                <div className="bg-gray-300 h-4 w-full"/>
                <div className="bg-gray-300 h-4 w-full"/>
            </div>
        </div>
    )
}

export default ProductSkeleton