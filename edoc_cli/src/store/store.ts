import { configureStore } from '@reduxjs/toolkit'

/**
 * APIから取得したデータの保存場所
 */
// useSelectorを実装する際に使用する型
export type RootState = ReturnType<typeof store.getState>;
// useDispatchを実装する際に使用する型
export type AppDispatch = typeof store.dispatch;

// reducerをstoreに登録する
export const store = configureStore({
    reducer: {
    },
});