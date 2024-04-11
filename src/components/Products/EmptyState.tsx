import { XCircle } from "lucide-react"

const EmptyState = () => {
    return <div className="relative col-span-full h-80 bg-gray-100 w-full p-12 flex flex-col items-center justify-center">
        <XCircle className="h-8 w-8 text-red-600" />
        <h3 className="font-semibold text-xl"> No Product Found</h3>
        <p className="text-zinc-500 text-sm">
            Oops.. No Searched product found
        </p>
    </div>
}

export default EmptyState