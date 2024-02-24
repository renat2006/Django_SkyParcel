import * as React from "react";
import {MessageCard} from "baseui/message-card";

export default () => {
    return (
        <div className="main__content">
            <MessageCard
                heading="О нашем сервисе доставки"
                buttonLabel="Узнать больше"
                onClick={() => alert("Подробнее о сервисе")}
                paragraph="Мы предлагаем уникальную услугу доставки посылок с использованием клиентских авиалиний. Наш сервис обеспечивает быструю и надежную доставку по всему миру, оптимизируя маршруты и сокращая время в пути. Мы стремимся предоставить нашим клиентам максимальный комфорт и гарантию безопасности их отправлений."
                image={{
                    src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
                }}
            />
        </div>
    );
}
