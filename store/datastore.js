import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const useDataStore = create(
    persist(
        (set, get) => ({
            data: [],
            images: [],
            backdrop: undefined,
            setBackdrop: ({ key, image }) => set({ backdrop: { key, image } }),
            addImage: (item) => {
                
                let images = get().images.slice(0)
                if(Array.isArray(item)) {

                    let item_list = item.filter((item_item) => {
                        let item_key = item_item.key
                        return !images.some((imgs) => imgs.key === item_key)
                    })

                    if(item_list.length > 0) {
                        images = images.concat(item_list)
                    }

                } else {

                    images.push(item)

                }

                set({ images })
            },
            getImage: (key) => get().images.slice(0).find((item) => item.key === key),
            add: (item) => {

                let data = get().data.slice(0)
                data.push(item)

                set({ data })

            },
            delete: (id) => {

                let data = get().data.slice(0).filter((a) => a.id !== id)

                set({ data })

            },
            edit: (id, item) => {

                let data = get().data.slice(0).map((a) => {
                    return a.id === id ? item : a
                })

                set({ data })

            },
            get: (id) => get().data.slice(0).find((a) => a.id.toString() === id),
            getByName: (name) => get().data.slice(0).find((a) => a.name.toLowerCase() === name.toLowerCase() || a.query.toLowerCase() === name.toLowerCase()),
            clear: () => set({ data: [] })
        }),
        {
            name: "mytrip-hokkaido-app-storage",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
)

export default useDataStore